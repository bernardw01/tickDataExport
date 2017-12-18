/**
 * Created by bernardwilliams on 8/31/17.
 */
var sessionUser = sessionStorage.getItem('email');
var tickRecordCount = 0;
var page = 0;

var config = {
    apiKey: "AIzaSyBPe65KqvuSXl5O7ZWEaAX7DbUzzhjx1_4",
    authDomain: "stratplanner-179201.firebaseapp.com",
    databaseURL: "https://stratplanner-179201.firebaseio.com",
    projectId: "stratplanner-179201",
    storageBucket: "stratplanner-179201.appspot.com",
    messagingSenderId: "78793308042"
};

$(document).ready(function () {
    $('.panel').hide();
    hideMenuItems();
    var initApp = function () {

        // Initialize Firebase

        firebase.initializeApp(config);

        firebase.auth().onAuthStateChanged(function (user) {

            if (user) {
                // User is signed in.
                $('#loginBanner').hide();
                $('#signOutLink').show();
                $('#signInLink').hide();
                console.log('Signing in a user ' + moment(Date.now()).calendar());
                var displayName = user.displayName;
                var email = user.email;
                var emailVerified = user.emailVerified;
                var photoURL = user.photoURL;
                var uid = user.uid;
                var phoneNumber = user.phoneNumber;
                var providerData = user.providerData;

                user.getToken().then(function (accessToken) {
                    console.log('Function get token');

                    sessionStorage.setItem('displayName', displayName);
                    sessionStorage.setItem('email', email);
                    sessionStorage.setItem('emailVerified', emailVerified);
                    sessionStorage.setItem('photoURL', photoURL);
                    sessionStorage.setItem('uid', uid);
                    sessionStorage.setItem('phoneNumber', phoneNumber);
                    sessionStorage.setItem('providerData', providerData);

                    //Write the current login back to the database
                    //updateUser(userProfileKey, userUpdate);

                    //Go back to the data base and get the user role based on the logged in user.
                    $('#currentUserImage').attr('src', photoURL);
                    $('#currentUserImage').attr('width', '48px');
                    $('#currentUserName').text(displayName);
                    $('#currentUserInfo').text(email);
                    getUserProfile(email);
                    $('.panel').show();
                });
            } else {
                // User is signed out.
                $('#signOutLink').hide();
                $('#signInLink').show();
                $('#sign-in-status').text('You are currently signed out');
            }
        }, function (error) {
            console.log(error);
        });
    };
    initApp();
});

$('#signOutLink').click(function () {
    console.log('Signing out');
    firebase.auth().signOut().then(function () {
        $('#loginBanner').show();
        console.log('Signed Out');
        window.location.assign('/');
        sessionStorage.clear();
    }, function (error) {
        console.error('Sign Out Error', error);
    });
});

$('#signInLink').click(function () {
    $('#loginBanner').hide();
    console.log('Signing In');
    window.location.assign('/signin');
});

$("#qbToolsBtn").click(function () {
    $("#qbSection").show();
    $("#tickToolsSection").hide();
});

$("#btnGetTickRecords").click(function () {
    getTickRecordCount('2017-04-01', '2017-09-30', function (resp) {
        console.log("RecordCount:", resp.tickRecordCount);
        console.log("Document:", resp.respDoc);
    });
});

$("#tickToolsBtn").click(function () {
    $("#qbSection").hide();
    $("#tickToolsSection").show();

});

$("#btnCleanTables").click(function () {
    cleanDB(function (resp) {
        console.log("Clean up Message:", resp.message);
    });
});

$("#btnRefreshTables").click(function () {
    getTickUserCount(function (resp) {
        console.log("RecordCount:", resp.tickRecordCount);
        console.log("Document:", resp.respDoc);
    });
    getTickClientCount(function (resp) {
        console.log("RecordCount:", resp.tickRecordCount);
        console.log("Document:", resp.respDoc);
    });
    getTickTaskCount(function (resp) {
        console.log("RecordCount:", resp.tickRecordCount);
        console.log("Document:", resp.respDoc);
    });
    getTickProjectCount(function (resp) {
        console.log("RecordCount:", resp.tickRecordCount);
        console.log("Document:", resp.respDoc);
    });
});

function setAuthorizedMenu(email) {
    //This method sets up the menu based on privileges of the signed in user.
    //is the person an admin?

    var userDB = new localUsers();

    console.log("I am here");
    console.log(email);
    if (userDB.validUser(email)) {
        $('#qbToolsBtn').show();
        $('#tickToolsBtn').show();
    }

    console.log("user email:", email);
    console.log("valid user:", userDB.validUser(email))
}

function getUserProfile(email) {
    setAuthorizedMenu(email);
};

function hideMenuItems() {
    $('#qbToolsBtn').hide();
    $('#tickToolsBtn').hide();
    $("#qbSection").hide();
    $("#tickToolsSection").hide();
};

function localUsers() {
    var userDB = [
        {
            name: "Bernard Williams",
            email: "bernard@theexperienceengine.com"
        },
        {
            name: "Camille Priest",
            email: "camille.priest@theexperienceengine.com"
        },
        {
            name: "Jessica Wrenn",
            email: "jessica.wrenn@theexperienceengine.com"
        }
    ];

    this.validUser = function (email) {
        console.log('Marker');
        for (var i = 0; i < userDB.length; i++) {

            if (email = userDB[i].email) {
                return true;
                break;
            } else {
                return false;
            }
        }
    }
}

function getTickUserCount(callback) {
    let queryURL = "/api/tickusers"

    return $.ajax({
        url: queryURL,
        method: 'GET'
    }).done(function (response) {
        callback(response);
    });
}

function getTickClientCount(callback) {
    let queryURL = "/api/tickclients"

    return $.ajax({
        url: queryURL,
        method: 'GET'
    }).done(function (response) {
        callback(response);
    });
}

function cleanDB(callback) {
    let queryURL = "/api/cleanDB"
    return $.ajax({
        url: queryURL,
        method: 'GET'
    }).done(function (response) {
//Todo do stuff here with the response from the server.
        callback(response);
    });
}

function getTickRecordCount(startDate, endDate, callback) {
    let queryURL = "/api/ticktime"
    let options = {
        startDate: startDate,
        endDate: endDate,
        page: page
    };
    return $.ajax({
        url: queryURL,
        method: 'POST',
        data: options
    }).done(function (response) {
//Todo do stuff here with the response from the server.
        callback(response);
    });
}

function getTickTaskCount(callback) {
    let queryURL = "/api/ticktasks"
    return $.ajax({
        url: queryURL,
        method: 'GET',
    }).done(function (response) {
        callback(response);
    });
}

function getTickProjectCount(callback) {
    let queryURL = "/api/tickprojects"
    return $.ajax({
        url: queryURL,
        method: 'GET',
    }).done(function (response) {
//Todo do stuff here with the response from the server.
        callback(response);
    });
}

