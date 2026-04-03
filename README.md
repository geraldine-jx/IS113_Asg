**Pet Adoption Platform**
A web application for browsing pets, managing user accounts, and supporting admin operations, built with Express.js, MongoDB, and EJS using an MVC-based structure.
Features
**User Registration and Login**
 Secure account creation and authentication
**Admin Registration and Login**
 Restricted to valid pre-approved employee IDs
**User Profile Management**
 View and update personal information
**Password Management**
 Change password securely
**Account Deletion**
 Delete account with password validation
**Session-Based Authentication**
 Protected routes for users and admins
**Pet Listings**
 Browse available pets and view detailed information
**Favorites**
 Save preferred pets
**View Count Recommendation**
 Receive personalized suggestions based on pet views and favorites
**Appointment Booking and Management**
 Schedule, view, edit, and cancel appointments
**Admin Dashboard**
 Access admin-specific features
**User Management**
 Admins can view and manage user accounts 
**Additional Features That Can Be Added**
Adoption Applications: Submit and track adoption requests
Application History: Track past applications
Email verification: 2 factor authentication
Pet Filtering: Filter pets by attributes such as breed or size

**Tech Stack**
Backend: Express.js with MVC architecture
Database: MongoDB with Mongoose ODM
Frontend: HTML, CSS
Templates: EJS
Authentication: express-session, bcrypt
Environment: Node.js


**Project Structure**
pet-adoption-platform/
├── controllers/
│   ├── adminController.js
│   ├── appointmentController.js
│   ├── authController.js
│   ├── formController.js
│   ├── homePageController.js
│   └── userprofileController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── appointment.js
│   ├── employees.js
│   ├── favourite.js
│   ├── pet.js
│   ├── petRequest.js
│   └── user.js
├── node_modules/
├── public/
│   └── index.html
├── routes/
│   ├── adminRoutes.js
│   ├── appointmentRoutes.js
│   ├── authRoutes.js
│   ├── formPage.js
│   ├── formPageRoutes.js
│   └── homeRoutes.js
├── views/
│   ├── user/
│   │   ├── forgot-password-user.ejs
│   │   ├── login-admin.ejs
│   │   ├── login-user.ejs
│   │   ├── profile.ejs
│   │   └── register-user.ejs
│   ├── admin/
│   │   ├── admin-adoption-create.ejs
│   │   ├── admin-adoption-details.ejs
│   │   ├── admin-adoption.ejs
│   │   ├── admin-analytics.ejs
│   │   ├── admin-approved-adoptions.ejs
│   │   ├── admin-dashboard.ejs
│   │   ├── admin-view-users.ejs
│   │   ├── adoption-listings.ejs
│   │   ├── giveup-create.ejs
│   │   ├── giveup-details.ejs
│   │   └── giveups.ejs
│   ├── pet/
│   │   ├── home-display.ejs
│   │   └── pet-details.ejs
│   ├── appointment/
│   │   ├── appointment.ejs
│   │   ├── findappointment.ejs
│   │   └── manageappointment.ejs
│   └── form/
│       ├── adopt-dog.ejs
│       ├── give-up-dog.ejs
│       ├── manage-adopt-request.ejs
│       ├── manage-rehome-request.ejs
│       ├── my-adopt-requests.ejs
│       └── my-rehome-requests.ejs
├── server.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
└── README.md

**CRUD Responsibilities**
**1) AUTH & PROFILE (Jia Quan)**
Create:
User signup and login

Read:
Display user profile details
Read employee login credentials from database

Update:
Edit profile (display name, bio, contact, address)
Forget Password 

Delete:
Delete user account (with password validation)
Delete user account (by admin)

Validation: 
Validate user credentials 
Validate admin credentials

**2) APPOINTMENTS (Valencia)**
Create:
Create appointment (name, date, time)

Read:
View appointment details

Update:
Edit appointment details

Delete:
Cancel appointment

**4) HOME PAGE (Geraldine)**
Create:
Create user favourites

Read:
Display all dogs (card layout)
View detailed dog information

Update:
Increment view count
Recommendation based on viewcount and favourites

Delete:
Delete user favourites

Validation:
Ensure user must be logged in to access home page

**5) ADOPTION & GIVE-UP FORMS (Jerlyn)**
Create:
Submit adoption request
Submit give-up request

Read:
View submitted requests

Update:
Edit request before approval

Delete:
Delete request before approval

**6) ADMIN FEATURES (Eashvar, Matrix)**
Create:
Add approved dogs into adoption listings
Create give up form on behalf of an owner
Create adoption form on behalf of potential adopter

Read:
View all adoption submissions
View all give up forms
View give-up request in detail
View all adoption request
View adoption request in detail
View approved adoption request

Update:
Approves give up request
Rejects give up request
Approve adoption request
Reject adoption request

Delete:
Delete give up request
Delete pet listing if give up already approved
Delete adoption request(pet becomes available again)

Validation:
Admin-only access
Handle invalid IDs
Clear success and error messages


**Installation**
**Clone the repository**
git clone <repository-url>
cd or navigate to repository

Install dependencies
npm install

Set up MongoDB
Use MongoDB Atlas or local MongoDB

Add your connection string in .env
MONGODB_URI=your_mongodb_connection_string

Start the application
nodemon server.js

Open your browser
http://127.0.0.1:8000

**Usage**
**For Users**
Register for a user account
Log in with your credentials
Browse pet listings
View and update your profile
Change password or delete account
Username: geraldine
Password:123456

-----------------------------------

**For Admins**
Register using a valid employee ID
Log in as admin
Access admin dashboard
View and manage users
EmployeeID: 0001
Password: 12345678

------------------------------------

**Database Schema**
**Appointment**
name: String
contact: String
date: String
time: String
appointmentType: String

**Employees**
employeeID: String
username: String
email: String
password: String
displayName: String
contact: String
address: String
bio: String
isRegistered: Boolean
Favourites
user: String
pet: String
viewCount: String

**Pet**
name: String
breed: String
size: String
gender: String
age: Number
hdbApproved: String
description: String
image: String
status: String
listingType: String
createdBy: ObjectId

**Pet Request**
userId: ObjectId
petId: ObjectId
createdByAdmin: ObjectId
userName: String
ownerName: String
requestType: String
petName: String
petBreed: String
petAge: Number
petSize: String
petHdbApproved: String
photo: String
contact : String
email: String
housing: String
address: String
reason: String
details: String
status: String
approvedBy: ObjectId
adminRemarks: String

**User**
usertype: String
employeeID: String
username: String
email: String
password: String
displayName: String
contact: String
address: String
bio: String
dateJoined: Date


**Notes**
Admin registration is restricted to employee IDs stored in the employees collection
Passwords are hashed using bcrypt for security
Session-based authentication is used to protect routes
MongoDB must be connected before running the application

**AI Usage Declaration**
This project made use of AI tools in a limited and supportive capacity:
Used to identify potential bugs and logical errors
Used to generate sample references based on lesson content
Used to assist with basic CSS styling in advanced features to improve data readability
All core logic, implementation, and system design were completed by the project team.





