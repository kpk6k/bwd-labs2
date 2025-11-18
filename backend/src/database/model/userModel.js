import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import bcrypt from 'bcryptjs';

// Define the 'users' model
const userModel = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        unique: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: { isEmail: true }
    },
	password: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	failed_attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    isLocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    lockUntil: {
        type: DataTypes.DATE,
    },
    createdAt: DataTypes.DATE
});

userModel.beforeCreate(async (user) => {
	user.password = await bcrypt.hash(user.password, 10);
});

sequelize.sync().then(() => {
   console.log("Table 'users' created successfully!");
}).catch((err) => {
   console.error("Unable to create table 'users': ", err);
});

export default userModel;
