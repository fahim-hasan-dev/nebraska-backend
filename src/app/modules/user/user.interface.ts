import { Model, Types } from "mongoose";
import { USER_ROLES, USER_STATUS } from "../../../enum/user";
export { USER_ROLES, USER_STATUS };

type IAuthentication = {
    restrictionLeftAt: Date | null
    resetPassword: boolean
    wrongLoginAttempts: number
    passwordChangedAt?: Date
    oneTimeCode: string
    latestRequestAt: Date
    expiresAt?: Date
    requestCount?: number
    authType?: 'createAccount' | 'resetPassword'
}

export type IUser = {
    _id: Types.ObjectId;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    role: USER_ROLES;
    verified: boolean;
    status: USER_STATUS;
    vehicleName?: string;
    password: string;
    authentication: IAuthentication;
    image?: string;
    deviceToken?: string;
    fcmToken?: string;
};

export type UserModel = {
    isPasswordMatched: (givenPassword: string, savedPassword: string) => Promise<boolean>;
} & Model<IUser>;
