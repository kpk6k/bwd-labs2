import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import userModel from "./userModel.js"

const userSession = sequelize.define('user_sessions', {
	id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
	userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
	ip: { type: DataTypes.STRING, allowNull: false },
	userAgent: { type: DataTypes.STRING, allowNull: false },
	lastSeenAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

userSession.belongsTo(userModel, { foreignKey: 'userId' });

sequelize.sync().then(() => {
   console.log("Table 'user_sessions' created successfully!");
}).catch((err) => {
   console.error("Unable to create table 'user_session': ", err);
});

export default userSession;
