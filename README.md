# E-Commarce API

** Resources **

1. User:
   User is the basis of all data creation. The user schema is detailed below. this format needs to be follow to sign up

   {
   firstName: String, // required
   lastName: String, // required
   password: String, // required, min 6 chars
   email: String, // required, formatted and, unique
   balance: Number, // optional
   shippingAddress: {
   _ line1: String, // required
   _ line2: String, // required
   _ city: String, // required
   _ province: String, // required
   _ postalCode: String, // required
   _ country: String, // required
   }
   }

   ** MOCK JSON DATA TO CREATE A USER **
   {
   "firstName" : "Sagar",
   "lastName": "Roy",
   "email" : "SaGar@gmail.com",
   "password" : "123456",
   "shippingAddress":{
   "line1" : "452 William St.",
   "city" : "Toronto",
   "province" : "ON",
   "postalCode" : "K23M9L",
   "country" : "Canada"
   }
   }

   On successful sign up the user will get a jwt token which will be needed to access routes that needs authorization.
   User can also login with email and password to receive jwt token

   \*\* header authorization should be: `Bearer ${token}`

2. Store
   User with authorization token can create store.
   The Store Schema is detailed below

   {
   name: String, // required
   address:{
   _ line1: String, // optional
   _ line2: String, // optional
   _ city: String, // optional
   _ province: String //optional
   _ postalCode: String //optional
   _ country: String //optional
   }
   }

   ** MOCK JSON DATA TO CREATE A STORE **
   {
   "name" : "awesome store",
   "address": {
   "line1" : "565 William street",
   "city": "Toronto",
   "country": "Canada"
   }
   }

3. Item
   Store owners can add item to their stores
   The item schema is detailed below

   {
   name: String, //required
   description: String, //reqired
   unitPrice: Number, //required
   quantity: Number //required
   }

   ** MOCK JSON DATA TO CREATE AN ITEM **

# End Points

** ------------------------ Test Routes ------------------------------ **

1. Method: GET
   End Point: "/"

   should return "hello world"

2. Method: POST
   End Point: "/"

   should return "data received"

** ----------------------- Auth Routes ------------------------------- **

1. Method: POST
   End Point: "/signup"

   req.body: USER-DATA (look resource 1 above)

   on success should return token which can be used to access restricted routes

2. Method: POST
   End Point: "/login"

   req.body: {"email: : "user-email", "password" : "user-password"}

   on success should return token.

** ------------------------ User Routes -------------------------------- **

1. Method: GET
   End Point: "/user"

   req.header: authorization: `Bearer ${token}`
   returns logged in user data.

2. Method: GET
   End Point: "/users"

   req.header.authorization: `Bearer ${token}`
   on success returns all the users saved in database

3. Method: PATCH
   End Point: "/user/update-user-info"

   req.header.authorization: `Bearer ${token}`
   req.body: Should contain the updated user field value.
   on success returns the updated user info

** --------------------- Store Routes ---------------------------------- **

1. Method: POST
   End Point: "/new-store"

   req.header.authorization: `Bearer ${token}`
   req.body: STORE-DATA (look at resource 2)
   on success returns the new store info

2. Method: GET
   End Point: "/stores"

   no auth needed
   on success returns all the stores in the database

3. Method: GET
   End Point: "/stores/:storeID"

   no auth needed
   on success returns the store data based on storeID

4. Method: GET
   End Point: "/stores/name/:storeName"

   req.header.authorization: `Bearer ${token}`
   storename must replace the " " with + in link
   retuens the stores (array) with found name

5. Method: GET
   End Point: "/stores/owner/:ownerID"

   Autorization needed
   return all the stores owned by owner whose id is passes in the link

6. Method: PATCH
   End Point: "/stores/update/:storeID"

   Authorization needed (must be owner)
   returns the updated store info

7. Method: DELETE
   End Point: "/stores/remove/:storeID"

   Authorization needed (must be owner)
   returns success message

**----------------------------- Item Routes ---------------------------- **

1. Method: POST
   End Point: "/items/additem/store/:storeID"

   Authorization needed. Must be owner of the provided store ID
   req.body: ITEM-DATA (look at resources 3)
   returns the added item

2. Method: GET
   End Point: "/items"

   No Authorization needed
   returns the added item

3. Method: GET
   End Point: "/items/serach-by-name/:itemName"

   Authorization needed
   returns all the item matching the name (search is case sensitive :( just noticed)

4. Method: GET
   End Point: "/items/:itemID"

   Authorization needed
   returns the item based on the provided item id

5. Method: GET
   End Point: "/items/store/:storeID"

   Authorization needed
   returns all the items in a store

6. Method: PATCH
   End Point: "/items/update/:itemID"

   Auth needed. only owner
   returns updated item
   Note: Quantity can be added or removed through this method

7. Method: DELETE
   End Point: "/items/remove/:itemID"

   Auth needed, only owner
   returns success message

8. Method: POST
   End Point: "/items/purchase/:itemID"

   Auth needed
   returns order item

   Multiple user trying to buy same item is handled through a update timestamp in the item. IF update time stamp does not match then item won't be updated and server will refetch item data and try again.

** --------------------------- Order Routes -------------------------- **

1. Method: GET
   End Point: "/orders"

   Auth needed
   returns all the orders

2. Method: GET
   End Point: "/orders/:orderID"

   Auth needed
   returns the specific order if found

3. Method: DELETE
   End Point: "/orders/remove-as-buyer/:orderID"

   Auth needed, must be buyer
   removed the order if it's not shipped yet and refunds user

4. Method: DELETE
   End Point: "/orders/remove-as-owner/:orderID"

   Auth needed, must be owner
   removes the order
