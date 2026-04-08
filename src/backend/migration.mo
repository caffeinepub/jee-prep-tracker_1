import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Old types inline — from previous version that used authorization mixin
  type UserRole = { #admin; #guest; #user };
  type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  type UserProfile = { name : Text };

  type OldActor = {
    accessControlState : AccessControlState;
    userData : Map.Map<Principal, Text>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type NewActor = {
    userData : Map.Map<Principal, Text>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    // Drop accessControlState intentionally — authorization mixin removed
    {
      userData = old.userData;
      userProfiles = old.userProfiles;
    };
  };
};
