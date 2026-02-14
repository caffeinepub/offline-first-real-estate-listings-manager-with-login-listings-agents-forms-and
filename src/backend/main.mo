import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import List "mo:core/List";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile Type
  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  type File = {
    id : Nat;
    fileName : Text;
    content : Storage.ExternalBlob;
    uploadedBy : Principal;
    uploadedAt : Int;
  };

  type Property = {
    ownerName : Text;
    contact : Text;
    address : Text;
    landArea : Text;
    notes : Text;
    attachments : [File];
    createdAt : Int;
    propertyType : Text;
    price : Text;
    locationUrl : Text;
    facing : Text;
    roadInfo : Text;
    nagarpalika : Text;
    mukhSize : Text;
    lambai : Text;
    createdBy : Principal;
  };

  type House = {
    ownerName : Text;
    contact : Text;
    location : Text;
    builtYear : Text;
    totalFloor : Text;
    rooms : Text;
    totalLandArea : Text;
    naksaPass : Text;
    price : Text;
    facing : Text;
    notes : Text;
    attachments : [File];
    createdAt : Int;
    createdBy : Principal;
  };

  type Agent = {
    name : Text;
    address : Text;
    contact : Text;
    workArea : Text;
    citizenshipUpload : File;
    createdAt : Int;
    createdBy : Principal;
  };

  type OtherProperty = {
    category : Text;
    title : Text;
    contact : Text;
    location : Text;
    price : Text;
    notes : Text;
    attachments : [File];
    createdAt : Int;
    createdBy : Principal;
  };

  let properties = Map.empty<Nat, Property>();
  let houses = Map.empty<Nat, House>();
  let agents = Map.empty<Nat, Agent>();
  let otherProperties = Map.empty<Nat, OtherProperty>();
  let files = Map.empty<Nat, File>();
  var nextFileId = 0;

  func compareByCreatedAt(a : Agent, b : Agent) : Order.Order {
    Int.compare(b.createdAt, a.createdAt);
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // File Management
  public shared ({ caller }) func uploadFile(fileName : Text, content : Storage.ExternalBlob) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload files");
    };
    let fileId = nextFileId;
    files.add(
      fileId,
      {
        id = fileId;
        fileName;
        content;
        uploadedBy = caller;
        uploadedAt = Time.now();
      },
    );
    nextFileId += 1;
    fileId;
  };

  public query ({ caller }) func getFile(id : Nat) : async ?File {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access files");
    };
    let fileOpt = files.get(id);
    switch (fileOpt) {
      case (null) { null };
      case (?file) {
        // Only admins or the uploader can access files
        if (not (AccessControl.isAdmin(accessControlState, caller)) and caller != file.uploadedBy) {
          Runtime.trap("Unauthorized: Only admins or the uploader can access this file");
        };
        ?file;
      };
    };
  };

  public shared ({ caller }) func deleteFile(id : Nat) : async () {
    let fileOpt = files.get(id);
    switch (fileOpt) {
      case (null) {
        Runtime.trap("File not found");
      };
      case (?file) {
        if (not (AccessControl.isAdmin(accessControlState, caller)) and caller != file.uploadedBy) {
          Runtime.trap("Unauthorized: Only admins or the uploader can delete this file");
        };
        files.remove(id);
      };
    };
  };

  // Property Management
  public shared ({ caller }) func saveProperty(property : Property) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create properties");
    };
    let id = properties.size() + 1;
    properties.add(
      id,
      {
        property with
        createdAt = Time.now();
        createdBy = caller;
      },
    );
    id;
  };

  public shared ({ caller }) func saveHouse(house : House) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create houses");
    };
    let id = houses.size() + 1;
    houses.add(
      id,
      {
        house with
        createdAt = Time.now();
        createdBy = caller;
      },
    );
    id;
  };

  public shared ({ caller }) func saveAgent(agent : Agent) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create agents");
    };
    let id = agents.size() + 1;
    agents.add(
      id,
      {
        agent with
        createdAt = Time.now();
        createdBy = caller;
      },
    );
    id;
  };

  public shared ({ caller }) func saveOtherProperty(otherProperty : OtherProperty) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create properties");
    };
    let id = otherProperties.size() + 1;
    otherProperties.add(
      id,
      {
        otherProperty with
        createdAt = Time.now();
        createdBy = caller;
      },
    );
    id;
  };

  // Query functions - require user authentication
  public query ({ caller }) func getProperty(id : Nat) : async ?Property {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view properties");
    };
    properties.get(id);
  };

  public query ({ caller }) func getHouse(id : Nat) : async ?House {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view houses");
    };
    houses.get(id);
  };

  public query ({ caller }) func getAgent(id : Nat) : async ?Agent {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view agents");
    };
    agents.get(id);
  };

  public query ({ caller }) func getOtherProperty(id : Nat) : async ?OtherProperty {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view properties");
    };
    otherProperties.get(id);
  };

  public query ({ caller }) func getAllAgentsSorted() : async [Agent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view agents");
    };
    let agentsList = List.empty<Agent>();

    for ((id, agent) in agents.entries()) {
      agentsList.add(agent);
    };

    agentsList.toArray().sort(compareByCreatedAt);
  };

  public query ({ caller }) func getPropertiesByType(propertyType : Text) : async [Property] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view properties");
    };
    let filteredProperties = List.empty<Property>();

    for ((id, property) in properties.entries()) {
      if (Text.equal(property.propertyType, propertyType)) {
        filteredProperties.add(property);
      };
    };

    filteredProperties.toArray();
  };

  // Delete operations - admin only or owner
  public shared ({ caller }) func deleteAgent(id : Nat) : async () {
    let agentOpt = agents.get(id);
    switch (agentOpt) {
      case (null) {
        Runtime.trap("Agent not found");
      };
      case (?agent) {
        if (not (AccessControl.isAdmin(accessControlState, caller)) and caller != agent.createdBy) {
          Runtime.trap("Unauthorized: Only admins or the creator can delete this agent");
        };
        agents.remove(id);
      };
    };
  };

  public shared ({ caller }) func deleteProperty(id : Nat) : async () {
    let propertyOpt = properties.get(id);
    switch (propertyOpt) {
      case (null) {
        Runtime.trap("Property not found");
      };
      case (?property) {
        if (not (AccessControl.isAdmin(accessControlState, caller)) and caller != property.createdBy) {
          Runtime.trap("Unauthorized: Only admins or the creator can delete this property");
        };
        properties.remove(id);
      };
    };
  };

  public shared ({ caller }) func deleteHouse(id : Nat) : async () {
    let houseOpt = houses.get(id);
    switch (houseOpt) {
      case (null) {
        Runtime.trap("House not found");
      };
      case (?house) {
        if (not (AccessControl.isAdmin(accessControlState, caller)) and caller != house.createdBy) {
          Runtime.trap("Unauthorized: Only admins or the creator can delete this house");
        };
        houses.remove(id);
      };
    };
  };

  public shared ({ caller }) func deleteOtherProperty(id : Nat) : async () {
    let propertyOpt = otherProperties.get(id);
    switch (propertyOpt) {
      case (null) {
        Runtime.trap("Property not found");
      };
      case (?property) {
        if (not (AccessControl.isAdmin(accessControlState, caller)) and caller != property.createdBy) {
          Runtime.trap("Unauthorized: Only admins or the creator can delete this property");
        };
        otherProperties.remove(id);
      };
    };
  };

  // Update operations - admin only or owner
  public shared ({ caller }) func updateAgent(id : Nat, updatedAgent : Agent) : async () {
    let agentOpt = agents.get(id);
    switch (agentOpt) {
      case (null) {
        Runtime.trap("Agent not found");
      };
      case (?agent) {
        if (not (AccessControl.isAdmin(accessControlState, caller)) and caller != agent.createdBy) {
          Runtime.trap("Unauthorized: Only admins or the creator can update this agent");
        };
        agents.add(
          id,
          {
            updatedAgent with
            createdBy = agent.createdBy;
            createdAt = agent.createdAt;
          },
        );
      };
    };
  };

  public shared ({ caller }) func updateProperty(id : Nat, updatedProperty : Property) : async () {
    let propertyOpt = properties.get(id);
    switch (propertyOpt) {
      case (null) {
        Runtime.trap("Property not found");
      };
      case (?property) {
        if (not (AccessControl.isAdmin(accessControlState, caller)) and caller != property.createdBy) {
          Runtime.trap("Unauthorized: Only admins or the creator can update this property");
        };
        properties.add(
          id,
          {
            updatedProperty with
            createdBy = property.createdBy;
            createdAt = property.createdAt;
          },
        );
      };
    };
  };

  public shared ({ caller }) func updateHouse(id : Nat, updatedHouse : House) : async () {
    let houseOpt = houses.get(id);
    switch (houseOpt) {
      case (null) {
        Runtime.trap("House not found");
      };
      case (?house) {
        if (not (AccessControl.isAdmin(accessControlState, caller)) and caller != house.createdBy) {
          Runtime.trap("Unauthorized: Only admins or the creator can update this house");
        };
        houses.add(
          id,
          {
            updatedHouse with
            createdBy = house.createdBy;
            createdAt = house.createdAt;
          },
        );
      };
    };
  };

  public shared ({ caller }) func updateOtherProperty(id : Nat, updatedProperty : OtherProperty) : async () {
    let propertyOpt = otherProperties.get(id);
    switch (propertyOpt) {
      case (null) {
        Runtime.trap("Property not found");
      };
      case (?property) {
        if (not (AccessControl.isAdmin(accessControlState, caller)) and caller != property.createdBy) {
          Runtime.trap("Unauthorized: Only admins or the creator can update this property");
        };
        otherProperties.add(
          id,
          {
            updatedProperty with
            createdBy = property.createdBy;
            createdAt = property.createdAt;
          },
        );
      };
    };
  };
};
