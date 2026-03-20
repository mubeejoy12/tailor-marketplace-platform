# Database Schema

---

# Users Table

users

id
name
email
password_hash
role
created_at

Roles

CUSTOMER
TAILOR
ADMIN

---

# Tailors Table

tailors

id
user_id
business_name
bio
location
rating
total_reviews
verified
created_at

---

# Designs Table

designs

id
tailor_id
title
description
price
category
image_url
created_at

Example categories

Agbada
Kaftan
Ankara
Buba
Wedding Wear

---

# Measurements Table

measurements

id
user_id
chest
waist
hip
shoulder
arm_length
neck
height
notes

---

# Orders Table

orders

id
customer_id
tailor_id
design_id
measurement_id
status
price
created_at

Order statuses

PENDING
IN_PROGRESS
READY
DELIVERED

---

# Reviews Table

reviews

id
order_id
customer_id
tailor_id
rating
comment
created_at