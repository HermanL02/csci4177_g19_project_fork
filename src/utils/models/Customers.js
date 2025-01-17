"use strict";
import { Schema, model, models } from "mongoose";

const Customers = Schema(
  {
    username: String,
    name: String,
    address: String,
    birthdate: Date,
    email: String,
    active: Boolean,
    accounts: [Number],
    tier_and_details: {
      tier: String,
      id: String,
      active: Boolean,
      benefits: [String],
    },
  },
  { strict: true }
);

Customers.index({
  username: "text",
  name: "text",
  address: "text",
  email: "text",
});

export default models.Customers || model("Customers", Customers);
