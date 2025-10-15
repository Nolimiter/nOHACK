# HackEX API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Guild System](#guild-system)
4. [Social Features](#social-features)
5. [Game Mechanics](#game-mechanics)
6. [Market System](#market-system)
7. [Real-time Features](#real-time-features)

## Authentication

### Register
- **Endpoint**: `POST /api/auth/register`
- **Description**: Register a new user account
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "confirmPassword": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "createdAt": "datetime"
    },
    "token": "string"
  }
  ```

### Login
- **Endpoint**: `POST /api/auth/login`
- **Description**: Authenticate user and receive JWT token
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "level": "number",
      "bitcoins": "number",
      "reputation": "number"
    },
    "token": "string"
  }
  ```

### Get User Profile
- **Endpoint**: `GET /api/auth/profile`
- **Description**: Get authenticated user's profile information
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "level": "number",
      "experience": "number",
      "reputation": "number",
      "bitcoins": "number",
      "darkTokens": "number",
      "avatar": "string",
      "bio": "string",
      "country": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  }
  ```

## User Management

### Update User Profile
- **Endpoint**: `PUT /api/user/profile`
- **Description**: Update user's profile information
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "avatar": "string",
    "bio": "string",
    "country": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Profile updated successfully",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "level": "number",
      "experience": "number",
      "reputation": "number",
      "bitcoins": "number",
      "darkTokens": "number",
      "avatar": "string",
      "bio": "string",
      "country": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  }
  ```

### Change Password
- **Endpoint**: `PUT /api/user/password`
- **Description**: Change user's password
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string",
    "confirmNewPassword": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Password changed successfully"
  }
  ```

## Guild System

### Create Guild
- **Endpoint**: `POST /api/guild`
- **Description**: Create a new guild
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "string",
    "tag": "string",
    "description": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Guild created successfully",
    "guild": {
      "id": "string",
      "name": "string",
      "tag": "string",
      "description": "string",
      "leaderId": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  }
  ```

### Get Guild by ID
- **Endpoint**: `GET /api/guild/:guildId`
- **Description**: Get detailed information about a specific guild
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "guild": {
      "id": "string",
      "name": "string",
      "tag": "string",
      "description": "string",
      "leaderId": "string",
      "members": [
        {
          "id": "string",
          "userId": "string",
          "role": "string",
          "user": {
            "id": "string",
            "username": "string",
            "level": "number",
            "avatar": "string"
          }
        }
      ],
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  }
  ```

### Get Guild by Name
- **Endpoint**: `GET /api/guild/name/:guildName`
- **Description**: Get detailed information about a specific guild by name
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "guild": {
      "id": "string",
      "name": "string",
      "tag": "string",
      "description": "string",
      "leaderId": "string",
      "members": [
        {
          "id": "string",
          "userId": "string",
          "role": "string",
          "user": {
            "id": "string",
            "username": "string",
            "level": "number",
            "avatar": "string"
          }
        }
      ],
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  }
  ```

### Update Guild
- **Endpoint**: `PUT /api/guild/:guildId`
- **Description**: Update guild information (leader only)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "string",
    "tag": "string",
    "description": "string",
    "isRecruiting": "boolean"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Guild updated successfully",
    "guild": {
      "id": "string",
      "name": "string",
      "tag": "string",
      "description": "string",
      "leaderId": "string",
      "isRecruiting": "boolean",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  }
  ```

### Delete Guild
- **Endpoint**: `DELETE /api/guild/:guildId`
- **Description**: Delete a guild (leader only)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "Guild deleted successfully"
  }
  ```

### Invite User to Guild
- **Endpoint**: `POST /api/guild/:guildId/invite`
- **Description**: Invite a user to join the guild
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "targetUserId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User invited to guild successfully"
  }
  ```

### Remove User from Guild
- **Endpoint**: `POST /api/guild/:guildId/remove`
- **Description**: Remove a user from the guild (leader or officer)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "targetUserId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User removed from guild successfully"
  }
  ```

### Transfer Guild Leadership
- **Endpoint**: `POST /api/guild/:guildId/transfer`
- **Description**: Transfer guild leadership to another member
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "newLeaderId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Guild leadership transferred successfully"
  }
  ```

### Get Recruiting Guilds
- **Endpoint**: `GET /api/guild/recruiting`
- **Description**: Get a list of guilds that are currently recruiting
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of items per page (default: 10, max: 50)
- **Response**:
  ```json
  {
    "guilds": [
      {
        "id": "string",
        "name": "string",
        "tag": "string",
        "description": "string",
        "leaderId": "string",
        "isRecruiting": "boolean",
        "memberCount": "number",
        "createdAt": "datetime",
        "updatedAt": "datetime"
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
  ```

## Social Features

### Send Message
- **Endpoint**: `POST /api/social/message`
- **Description**: Send a message to another user
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "receiverId": "string",
    "subject": "string",
    "body": "string",
    "attachments": "object"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Message sent successfully",
    "messageData": {
      "id": "string",
      "senderId": "string",
      "receiverId": "string",
      "subject": "string",
      "body": "string",
      "isRead": "boolean",
      "sentAt": "datetime",
      "readAt": "datetime",
      "sender": {
        "id": "string",
        "username": "string"
      },
      "receiver": {
        "id": "string",
        "username": "string"
      }
    }
  }
  ```

### Get Inbox
- **Endpoint**: `GET /api/social/inbox`
- **Description**: Get user's inbox messages
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of items per page (default: 10, max: 50)
- **Response**:
  ```json
  {
    "messages": [
      {
        "id": "string",
        "senderId": "string",
        "receiverId": "string",
        "subject": "string",
        "body": "string",
        "isRead": "boolean",
        "sentAt": "datetime",
        "readAt": "datetime",
        "sender": {
          "id": "string",
          "username": "string"
        }
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
  ```

### Get Sent Messages
- **Endpoint**: `GET /api/social/sent`
- **Description**: Get user's sent messages
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of items per page (default: 10, max: 50)
- **Response**:
  ```json
  {
    "messages": [
      {
        "id": "string",
        "senderId": "string",
        "receiverId": "string",
        "subject": "string",
        "body": "string",
        "isRead": "boolean",
        "sentAt": "datetime",
        "readAt": "datetime",
        "receiver": {
          "id": "string",
          "username": "string"
        }
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
  ```

### Mark Message as Read
- **Endpoint**: `PUT /api/social/message/:messageId/read`
- **Description**: Mark a message as read
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "Message marked as read"
  }
  ```

### Delete Message
- **Endpoint**: `DELETE /api/social/message/:messageId`
- **Description**: Delete a message
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "Message deleted successfully"
  }
  ```

### Send Friend Request
- **Endpoint**: `POST /api/social/friend/request`
- **Description**: Send a friend request to another user
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "toUserId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Friend request sent successfully",
    "friendship": {
      "id": "string",
      "userFromId": "string",
      "userToId": "string",
      "status": "string",
      "createdAt": "datetime",
      "acceptedAt": "datetime",
      "userFrom": {
        "id": "string",
        "username": "string"
      },
      "userTo": {
        "id": "string",
        "username": "string"
      }
    }
  }
  ```

### Accept Friend Request
- **Endpoint**: `PUT /api/social/friend/request/:friendshipId/accept`
- **Description**: Accept a friend request
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "Friend request accepted successfully",
    "friendship": {
      "id": "string",
      "userFromId": "string",
      "userToId": "string",
      "status": "string",
      "createdAt": "datetime",
      "acceptedAt": "datetime",
      "userFrom": {
        "id": "string",
        "username": "string"
      },
      "userTo": {
        "id": "string",
        "username": "string"
      }
    }
  }
  ```

### Reject Friend Request
- **Endpoint**: `PUT /api/social/friend/request/:friendshipId/reject`
- **Description**: Reject a friend request
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "Friend request rejected successfully"
  }
  ```

### Get Friends
- **Endpoint**: `GET /api/social/friends`
- **Description**: Get user's friends list
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "friends": [
      {
        "id": "string",
        "username": "string",
        "level": "number",
        "avatar": "string"
      }
    ]
  }
  ```

### Get Pending Friend Requests
- **Endpoint**: `GET /api/social/friend-requests`
- **Description**: Get user's pending friend requests
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "requests": [
      {
        "id": "string",
        "userFromId": "string",
        "userToId": "string",
        "status": "string",
        "createdAt": "datetime",
        "userFrom": {
          "id": "string",
          "username": "string"
        }
      }
    ]
  }
  ```

### Block User
- **Endpoint**: `POST /api/social/friend/block`
- **Description**: Block a user
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "targetUserId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User blocked successfully"
  }
  ```

### Unblock User
- **Endpoint**: `POST /api/social/friend/unblock`
- **Description**: Unblock a user
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "targetUserId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User unblocked successfully"
  }
  ```

## Game Mechanics

### Start Operation
- **Endpoint**: `POST /api/game/operation/start`
- **Description**: Start a hacking operation
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "type": "string",
    "targetId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Operation started successfully",
    "operationId": "string"
  }
  ```

### Cancel Operation
- **Endpoint**: `POST /api/game/operation/cancel`
- **Description**: Cancel an ongoing operation
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "operationId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Operation cancelled successfully"
  }
  ```

### Get User Operations
- **Endpoint**: `GET /api/game/operations`
- **Description**: Get user's operations history
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "operations": [
      {
        "id": "string",
        "userId": "string",
        "type": "string",
        "targetId": "string",
        "status": "string",
        "progress": "number",
        "startedAt": "datetime",
        "completedAt": "datetime",
        "result": "object",
        "createdAt": "datetime"
      }
    ]
  }
  ```

### Get Operation by ID
- **Endpoint**: `GET /api/game/operation/:operationId`
- **Description**: Get details of a specific operation
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "operation": {
      "id": "string",
      "userId": "string",
      "type": "string",
      "targetId": "string",
      "status": "string",
      "progress": "number",
      "startedAt": "datetime",
      "completedAt": "datetime",
      "result": "object",
      "createdAt": "datetime"
    }
  }
  ```

## Market System

### Create Market Listing
- **Endpoint**: `POST /api/market/listing`
- **Description**: Create a new market listing
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "itemId": "string",
    "quantity": "number",
    "pricePerUnit": "number"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Listing created successfully",
    "listing": {
      "id": "string",
      "sellerId": "string",
      "itemId": "string",
      "quantity": "number",
      "pricePerUnit": "number",
      "status": "string",
      "expiresAt": "datetime",
      "createdAt": "datetime"
    }
  }
  ```

### Get Active Market Listings
- **Endpoint**: `GET /api/market/listings`
- **Description**: Get all active market listings
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of items per page (default: 20, max: 100)
  - `category`: Filter by item category
  - `search`: Search term for item names
- **Response**:
  ```json
  {
    "listings": [
      {
        "id": "string",
        "sellerId": "string",
        "itemId": "string",
        "quantity": "number",
        "pricePerUnit": "number",
        "status": "string",
        "expiresAt": "datetime",
        "createdAt": "datetime",
        "item": {
          "id": "string",
          "name": "string",
          "type": "string",
          "category": "string",
          "rarity": "string",
          "description": "string",
          "basePrice": "number",
          "stats": "object"
        },
        "seller": {
          "username": "string"
        }
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
  ```

### Purchase Market Listing
- **Endpoint**: `POST /api/market/listing/:listingId/purchase`
- **Description**: Purchase an item from a market listing
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "quantity": "number"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Purchase successful",
    "transaction": {
      "id": "string",
      "buyerId": "string",
      "listingId": "string",
      "quantity": "number",
      "totalPrice": "number",
      "fee": "number",
      "createdAt": "datetime"
    }
  }
  ```

### Cancel Market Listing
- **Endpoint**: `DELETE /api/market/listing/:listingId`
- **Description**: Cancel a market listing (only by the seller)
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "Listing cancelled successfully"
  }
  ```

### Get User Listings
- **Endpoint**: `GET /api/market/listings/user`
- **Description**: Get user's active market listings
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "listings": [
      {
        "id": "string",
        "sellerId": "string",
        "itemId": "string",
        "quantity": "number",
        "pricePerUnit": "number",
        "status": "string",
        "expiresAt": "datetime",
        "createdAt": "datetime",
        "item": {
          "id": "string",
          "name": "string",
          "type": "string",
          "category": "string",
          "rarity": "string",
          "description": "string",
          "basePrice": "number",
          "stats": "object"
        }
      }
    ]
  }
  ```

### Get User Transactions
- **Endpoint**: `GET /api/market/transactions`
- **Description**: Get user's transaction history
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of items per page (default: 20, max: 100)
- **Response**:
  ```json
  {
    "transactions": [
      {
        "id": "string",
        "buyerId": "string",
        "listingId": "string",
        "quantity": "number",
        "totalPrice": "number",
        "fee": "number",
        "createdAt": "datetime",
        "listing": {
          "id": "string",
          "itemId": "string",
          "quantity": "number",
          "pricePerUnit": "number",
          "status": "string",
          "expiresAt": "datetime",
          "createdAt": "datetime",
          "item": {
            "id": "string",
            "name": "string",
            "type": "string",
            "category": "string",
            "rarity": "string",
            "description": "string",
            "basePrice": "number",
            "stats": "object"
          },
          "seller": {
            "username": "string"
          }
        }
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
  ```

## Real-time Features

### WebSocket Connection
- **Endpoint**: `ws://localhost:4000`
- **Description**: Establish a WebSocket connection for real-time features
- **Authentication**: Pass JWT token in handshake:
  ```javascript
  const socket = io('http://localhost:4000', {
    auth: {
      token: 'your-jwt-token'
    }
  });
  ```

### Game State Updates
- **Event**: `game:state:update`
- **Description**: Receive real-time updates about game state
- **Payload**:
  ```json
  {
    "userId": "string",
    "resources": {
      "bitcoins": "number",
      "reputation": "number",
      "darkTokens": "number"
    },
    "activeOperations": [
      {
        "id": "string",
        "type": "string",
        "targetId": "string",
        "status": "string",
        "progress": "number"
      }
    ],
    "alerts": [
      {
        "type": "string",
        "message": "string"
      }
    ]
  }
  ```

### Operation Progress
- **Event**: `operation:progress`
- **Description**: Receive real-time updates about operation progress
- **Payload**:
  ```json
  {
    "operationId": "string",
    "progress": "number",
    "currentStep": "string",
    "eta": "number"
  }
  ```

### Incoming Attack
- **Event**: `attack:incoming`
- **Description**: Receive notification about an incoming attack
- **Payload**:
  ```json
  {
    "attackId": "string",
    "attackerId": "string",
    "attackerName": "string",
    "type": "string",
    "severity": "string",
    "detected": "boolean"
  }
  ```

### Chat Message
- **Event**: `chat:message`
- **Description**: Receive chat messages in real-time
- **Payload**:
  ```json
  {
    "userId": "string",
    "username": "string",
    "message": "string",
    "timestamp": "datetime"
  }
  ```

### Market Price Update
- **Event**: `market:price:update`
- **Description**: Receive real-time updates about market prices
- **Payload**:
  ```json
  {
    "itemId": "string",
    "newPrice": "number"
  }