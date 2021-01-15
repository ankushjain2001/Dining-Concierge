// Register function
function register() {
      
  var personalname =  document.getElementById("personalnameRegister").value;	
  var username = document.getElementById("emailInputRegister").value;
  
  if (document.getElementById("passwordInputRegister").value != document.getElementById("confirmationpassword").value) {
    alert("Passwords Do Not Match!")
    throw "Passwords Do Not Match!"
  } else {
    var password =  document.getElementById("passwordInputRegister").value;	
  }
  
  var poolData = {
    UserPoolId : _config.cognito.userPoolId,
    ClientId : _config.cognito.clientId
    };		
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  var attributeList = [];
  
  var dataEmail = {
    Name : 'email', 
    Value : username,
  };
  
  var dataPersonalName = {
    Name : 'name', 
    Value : personalname,
  };

  var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
  var attributePersonalName = new AmazonCognitoIdentity.CognitoUserAttribute(dataPersonalName);
  
  
  attributeList.push(attributeEmail);
  attributeList.push(attributePersonalName);

  userPool.signUp(username, password, attributeList, null, function(err, result){
    if (err) {
      alert(err.message || JSON.stringify(err));
      return;
    }
    cognitoUser = result.user;
    // console.log('Username: ' + cognitoUser.getUsername());
    document.getElementById("alert-register").innerHTML = "Check your email for a verification link";
    
  });
};


// Log in function
function logIn() {

  var authenticationData = {
    Username : document.getElementById("usernameLogin").value,
    Password : document.getElementById("passwordLogin").value,
  };
  
  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    
  var poolData = {
    UserPoolId : _config.cognito.userPoolId,
    ClientId : _config.cognito.clientId,
    };
  
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  
  var userData = {
    Username : document.getElementById("usernameLogin").value,
    Pool : userPool,
  };
  
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      var accessToken = result.getAccessToken().getJwtToken();
      // console.log(accessToken);
      window.location.reload();
    },
    onFailure: function(err) {
      alert(err.message || JSON.stringify(err));
    },
  });
};

// Log out function
function logOut(){
  if (cognitoUser != null) {
    cognitoUser.signOut();	  
  }
  window.location.reload();
};


// Page Content Loader
var data = { 
  UserPoolId : _config.cognito.userPoolId,
  ClientId : _config.cognito.clientId
};
var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
var cognitoUser = userPool.getCurrentUser();

window.onload = function(){
  if (cognitoUser != null) {

    document.getElementById("landing-page").style.display = "none";
    document.getElementById("logout-btn").style.display = "table";

    cognitoUser.getSession(function(err, session) {
      if (err) {
        alert(err);
        return;
      }
      // console.log('Session Valid: ' + session.isValid());
      cognitoUser.getUserAttributes(function(err, result) {
        if (err) {
          console.log(err);
          return;
        }
        // console.log(result);
        document.getElementById("auth-text").innerHTML = "Welcome " + result[2].getValue() + "!";	
      });			
    });
  }
  else{
    document.getElementById("auth-page").style.display = "none";
  }
};
