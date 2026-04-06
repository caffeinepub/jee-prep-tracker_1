import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  type Actor = {
    userData : Map.Map<Principal, Text>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type as required by instructions
  public type UserProfile = {
    name : Text;
  };

  // Stable storage for user data (JSON blobs)
  let userData = Map.empty<Principal, Text>();

  // Stable storage for user profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Get caller's user profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    // Any authenticated user (including guests) can get their own profile
    // No authorization check needed - anyone can view their own profile
    userProfiles.get(caller);
  };

  // Get another user's profile (admin-only or own profile)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Save caller's user profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    // Any authenticated user (including guests) can save their own profile
    // No authorization check needed per the app requirements
    userProfiles.add(caller, profile);
  };

  // Save all app data for the caller
  public shared ({ caller }) func saveAllData(json : Text) : async () {
    // Per requirements: "any anonymous caller can save and load their own data"
    // Anonymous principals are treated as guests, and guests can use the app
    // No authorization check needed - everyone can save their own data
    userData.add(caller, json);
  };

  // Load all app data for the caller
  public query ({ caller }) func loadAllData() : async ?Text {
    // Any caller (including anonymous/guests) can load their own data
    // No authorization check needed
    userData.get(caller);
  };
};
