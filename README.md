# Volunteer Hours Management System

This Volunteer Management System is a full-stack web application designed to track and manage volunteer hours for nonprofit organizations. It supports different user roles (volunteer, officer, admin) and provides a range of functionalities from logging hours to approving requests and exporting data for award applications.

![hippo](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExenFpMXFnMDByMzIwcXQzeWR5cXd6bWZla2o5YjE2aDdmZjNmbXh2biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/XOQQw44sg1H0Iak4Oj/giphy.gif)



## Features

- **User Roles**: Three distinct user roles with specific functionalities:
  - **Volunteers**: Can log in, request hours, and view their activity logs.
  - **Officers**: Can request hours on behalf of a group of volunteers.
  - **Admins**: Can approve or deny hour requests and export detailed reports.
- **Secure Authentication**: Utilizes bcrypt for generating session ID cookies to manage sessions securely.
- **Data Export**: Admins can export comprehensive data reports for submissions to volunteer service organizations.
- **Forgot Password Feature**: Includes a system for password recovery to enhance user accessibility and security.

## Technologies Used

- **Frontend**: React, TypeScript
- **Backend**: Node.js, Express
- **Database**: MySQL
- **Authentication**: bcrypt
- **Development Tools**: VSCode, GitHub
- **Deployment**: Amazon Web Services (AWS), Caddy, Route 53
- **Email Handling**: SES for tracking bounces and complaints

## Getting Started
This repository contains no backend code or commit history for security purposes. By cloning this repository, you will be able to run a webdevpack server to work with the frontend. For full functionality, you will need to implement the backend according to the API calls made in the frontend. The full website has been deployed <a href=https://volunteers.surdaan.org>here<a>. You may also contact me at arnavmazumder2023@gmail.com if you are interested in seeing the full project.

### Prerequisites

- Node.js

### Installing

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/volunteer-management-system.git

2. **Enter the client directory**
   ```bash
   cd volunteer_management_system/client

3. **Install node modules**
   ```bash
   npm install

4. **Start the webdevserver**
   ```bash
   npm run start

