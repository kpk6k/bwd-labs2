import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './userModel.js';

export interface UserSessionAttributes {
    id: number;
    userId: number;
    ip: string;
    userAgent: string;
    lastSeenAt: Date;
}

type UserSessionCreationAttributes = Optional<UserSessionAttributes, 'id'>;

class userSession
    extends Model<UserSessionAttributes, UserSessionCreationAttributes>
    implements UserSessionAttributes
{
    public id!: number;
    public userId!: number;
    public ip!: string;
    public userAgent!: string;
    public lastSeenAt!: Date;
}

userSession.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        ip: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userAgent: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastSeenAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'userSession',
        timestamps: false,
    },
);

User.hasMany(userSession, { foreignKey: 'userId' });
userSession.belongsTo(User, { foreignKey: 'userId' });

sequelize
    .sync()
    .then(() => {
        console.log("Table 'user_sessions' created successfully!");
    })
    .catch((err: Error) => {
        console.error("Unable to create table 'user_session': ", err);
    });

export default userSession;
