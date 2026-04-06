import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldActor = {};
  type NewActor = {
    userData : Map.Map<Principal, Text>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type UserProfile = {
    name : Text;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      userData = Map.empty<Principal, Text>();
      userProfiles = Map.empty<Principal, UserProfile>();
    };
  };
};
