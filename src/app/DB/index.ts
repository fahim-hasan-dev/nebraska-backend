import config from '../../config'
import { USER_ROLES, USER_STATUS } from '../../enum/user'
import { User } from '../modules/user/user.model'
import { logger } from '../../shared/logger'
import colors from 'colors'

export const seedAdmin = async () => {
    const adminEmail = config.super_admin.email
    const adminPassword = config.super_admin.password

    if (!adminEmail || !adminPassword) {
        logger.warn(
            colors.yellow(
                '⚠️ Admin email or password is not configured in .env. Skipping admin seeding.'
            )
        )
        return
    }

    try {
        // Check if a super admin user already exists
        const isAdminExist = await User.findOne({
            $or: [
                { role: USER_ROLES.SUPER_ADMIN },
                { email: adminEmail }
            ]
        })

        if (isAdminExist) {
            logger.info(
                colors.blue(
                    'ℹ️ Admin/Super Admin account already exists. Skipping admin creation.'
                )
            )
            return
        }

        // Construct the admin user data
        const adminData = {
            email: adminEmail,
            password: adminPassword,
            fullName: config.super_admin.name || 'Super Admin',
            phone: '+1234567890',
            address: 'Nebraska, USA',
            role: USER_ROLES.SUPER_ADMIN,
            verified: true,
            status: USER_STATUS.ACTIVE,
        }

        // Create the admin user
        await User.create(adminData)
        logger.info(colors.green('🚀 Admin account created successfully!'))
    } catch (error) {
        logger.error(colors.red('❌ Failed to seed admin account:'), error)
    }
}
