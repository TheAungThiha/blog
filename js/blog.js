$(function() {
 
    Parse.$ = jQuery;
 
    // Replace this line with the one on your Quickstart Guide Page
    Parse.initialize("e1hTjOylez6LD007TtrLKCIfGXMNWxfSaSEJ6JSP", "dMobJdcZ9ZGKtm4FRJP1jteP1CnsKKqgGKhQRsPi");

 
    var TestObject = Parse.Object.extend("TestObject");
    var testObject = new TestObject();
    testObject.save({blog: "nothing"}).then(function(object) {
      alert("my first save");
    });
 
});