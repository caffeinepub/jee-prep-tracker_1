import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Migration "migration";

(with migration = Migration.run)
actor {
  // User profile type
  public type UserProfile = {
    name : Text;
  };

  // Stable storage for user data (JSON blobs)
  let userData = Map.empty<Principal, Text>();

  // Stable storage for user profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Get caller's user profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  // Save caller's user profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // Save all app data for the caller
  public shared ({ caller }) func saveAllData(json : Text) : async () {
    userData.add(caller, json);
  };

  // Load all app data for the caller
  public query ({ caller }) func loadAllData() : async ?Text {
    userData.get(caller);
  };
};
