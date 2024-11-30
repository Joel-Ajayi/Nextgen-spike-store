# **[NextgenSpike](https://nextgen-store-5f0bea566c44.herokuapp.com/)**

**NextgenSpike** is a modern e-commerce platform for **electronics** and **computer accessories**. It features a robust **client interface** and a powerful **controller system** for managing users, products, and orders. The application is built with a client app powered by ReactJS and TypeScript, and a server built with Node.js and Express using GraphQL API. The database is MongoDB with Prisma ORM, all using TypeScript.

See [NextgenSpike](https://nextgen-store-5f0bea566c44.herokuapp.com) to view Web App.
---

## **Features**

### **Client App**
- **Home Page**: Display featured products and categories.
- **Product Catalog**:
  - Browse electronics and computer accessories.
  - Sorting, filtering, and search functionalities.
- **Cart**:
  - Add items and choose payment methods:
    - **Card Payment**: Secured via payment gateway.
    - **Cash on Delivery**.
- **Orders Page**: Track order and payment statuses.
  
> - **Note:**
     Payment with Card is on test mode. Again, Orders are not actually delivered. Order status are however updated for users with permission on the controller.

### **Controller App**
- **User Roles**:
  - Manage user permissions with roles such as:
    - **User** (Basic user)
    - **Product Manager**
    - **Order Manager**
    - **Brand/Category Manager**
    - **SuperAdmin**
    - **Global** (All permissions)
- **Product & Brand Management**:
  - Add, edit, and delete products and brands.
  - View detailed listings.
- **Category Management**:
  - Add, edit, and manage product categories.
  - View all categories.
- **Order Management**:
  - Update payment and order statuses.

---

## **Tech Stack**

### **Client**
- **Framework**: React.js
- **Language**: TypeScript

### **Server**
- **Framework**: Node.js, Express
- **API**: GraphQL

### **Database**
- **DBMS**: MongoDB
- **ORM**: Prisma

### **Deployment**
- **Platform**: Heroku

---
