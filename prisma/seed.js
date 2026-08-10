"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
var err_codes_1 = require("../src/common/exceptions/err-codes");
var password_1 = require("../src/shared/utils/password/password");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var platformAdminEmail, platformAdminPhone, platformAdminPassword, platformAdminUser, hashedPasswords, roles, _i, roles_1, role, permissions, _a, permissions_1, permission, platformAdminRole, allPermissions, _b, allPermissions_1, permission, adminRole, adminPermissionNames, adminPermissions, _c, adminPermissions_1, permission;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log('Starting database seeded........');
                    platformAdminEmail = process.env.PLATFORM_ADMIN_EMAIL;
                    platformAdminPhone = process.env.PLATFORM_ADMIN_PHONE;
                    platformAdminPassword = process.env.PLATFORM_ADMIN_PASSWORD;
                    console.log('The platform admin email =>', platformAdminEmail);
                    console.log('The platform admin phone=>', platformAdminPhone);
                    console.log('The platform admin password=>', platformAdminPassword);
                    if (!platformAdminEmail || !platformAdminPassword) {
                        throw new common_1.BadRequestException({
                            code: err_codes_1.ErrorCode.BAD_REQUEST_EXCEPTION,
                            message: 'Platform admin and password are missing on .env',
                        });
                    }
                    return [4 /*yield*/, prisma.user.findUnique({
                            where: {
                                email: platformAdminEmail,
                            },
                        })];
                case 1:
                    platformAdminUser = _d.sent();
                    if (!!platformAdminUser) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, password_1.hashPassword)(platformAdminPassword)];
                case 2:
                    hashedPasswords = _d.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                firstName: 'Platform Admin',
                                lastName: '',
                                email: platformAdminEmail,
                                phone: platformAdminPhone,
                                password: hashedPasswords,
                                isActive: true,
                            },
                        })];
                case 3:
                    platformAdminUser = _d.sent();
                    console.log("Platform admin created: ".concat(platformAdminUser.email));
                    return [3 /*break*/, 5];
                case 4:
                    console.log("The Platform admin exists: ".concat(platformAdminUser.email));
                    _d.label = 5;
                case 5:
                    roles = [
                        {
                            name: 'PLATFORM_ADMIN',
                            description: 'Full system access',
                            isSystem: true,
                        },
                        {
                            name: 'ADMIN',
                            description: 'Institute Administrator',
                            isSystem: true,
                        },
                        {
                            name: 'STUDENT',
                            description: 'Student role',
                            isSystem: true,
                        },
                        {
                            name: 'REVIEWER',
                            description: 'Reviewer role for kyc verification',
                            isSystem: true,
                        },
                    ];
                    _i = 0, roles_1 = roles;
                    _d.label = 6;
                case 6:
                    if (!(_i < roles_1.length)) return [3 /*break*/, 9];
                    role = roles_1[_i];
                    return [4 /*yield*/, prisma.role.upsert({
                            where: {
                                name: role.name,
                            },
                            create: role,
                            update: {},
                        })];
                case 7:
                    _d.sent();
                    _d.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 6];
                case 9:
                    console.log('The roles are seeded');
                    permissions = [
                        //User
                        { name: 'user.view', module: 'user' },
                        { name: 'user.create', module: 'user' },
                        { name: 'user.update', module: 'user' },
                        { name: 'user.delete', module: 'user' },
                        { name: 'user.activate', module: 'user' },
                        //Institute
                        { name: 'institute.create', module: 'institute' },
                        { name: 'institute.view', module: 'institute' },
                        { name: 'institute.update', module: 'institute' },
                        { name: 'institute.suspend', module: 'institute' },
                        //Kyc
                        { name: 'kyc.view', module: 'kyc' },
                        { name: 'kyc.update', module: 'kyc' },
                        { name: 'kyc.approve', module: 'kyc' },
                        { name: 'kyc.reject', module: 'kyc' },
                        //Course
                        { name: 'course.view', module: 'course' },
                        { name: 'course.create', module: 'course' },
                        { name: 'course.update', module: 'course' },
                        { name: 'course.delete', module: 'course' },
                        { name: 'course.publish', module: 'course' },
                        //Course material
                        { name: 'course_material.view', module: 'course_material' },
                        { name: 'course_material.upload', module: 'course_material' },
                        { name: 'course_material.delete', module: 'course_material' },
                    ];
                    _a = 0, permissions_1 = permissions;
                    _d.label = 10;
                case 10:
                    if (!(_a < permissions_1.length)) return [3 /*break*/, 13];
                    permission = permissions_1[_a];
                    return [4 /*yield*/, prisma.permission.upsert({
                            where: {
                                name: permission.name,
                            },
                            create: permission,
                            update: {},
                        })];
                case 11:
                    _d.sent();
                    _d.label = 12;
                case 12:
                    _a++;
                    return [3 /*break*/, 10];
                case 13:
                    console.log('permission seeded');
                    return [4 /*yield*/, prisma.role.findUnique({
                            where: {
                                name: 'PLATFORM_ADMIN',
                            },
                        })];
                case 14:
                    platformAdminRole = _d.sent();
                    if (!platformAdminRole) {
                        throw new common_1.NotFoundException({
                            code: err_codes_1.ErrorCode.BAD_REQUEST_EXCEPTION,
                            message: 'Platform admin role not found',
                        });
                    }
                    return [4 /*yield*/, prisma.permission.findMany()];
                case 15:
                    allPermissions = _d.sent();
                    _b = 0, allPermissions_1 = allPermissions;
                    _d.label = 16;
                case 16:
                    if (!(_b < allPermissions_1.length)) return [3 /*break*/, 19];
                    permission = allPermissions_1[_b];
                    return [4 /*yield*/, prisma.rolePermissionAssignment.upsert({
                            where: {
                                roleId_permissionId: {
                                    roleId: platformAdminRole.id,
                                    permissionId: permission.id,
                                },
                            },
                            create: {
                                roleId: platformAdminRole.id,
                                permissionId: permission.id,
                            },
                            update: {},
                        })];
                case 17:
                    _d.sent();
                    _d.label = 18;
                case 18:
                    _b++;
                    return [3 /*break*/, 16];
                case 19:
                    console.log("Platform admin granted ".concat(allPermissions.length, " permissions"));
                    //-----------------------------------------
                    //7.Assign platform admin role to admin user
                    //------------------------------------------
                    return [4 /*yield*/, prisma.userRoleAssignment.upsert({
                            where: {
                                userId_roleId: {
                                    userId: platformAdminUser.id,
                                    roleId: platformAdminRole.id,
                                },
                            },
                            create: {
                                userId: platformAdminUser.id,
                                roleId: platformAdminRole.id,
                            },
                            update: {},
                        })];
                case 20:
                    //-----------------------------------------
                    //7.Assign platform admin role to admin user
                    //------------------------------------------
                    _d.sent();
                    console.log('Platform_admin role assigned to user');
                    return [4 /*yield*/, prisma.role.findUnique({
                            where: {
                                name: 'ADMIN',
                            },
                        })];
                case 21:
                    adminRole = _d.sent();
                    if (!adminRole) {
                        throw new common_1.NotFoundException({
                            code: err_codes_1.ErrorCode.BAD_REQUEST_EXCEPTION,
                            message: 'ADMIN role not found',
                        });
                    }
                    adminPermissionNames = [
                        'user.view',
                        'user.create',
                        'user.update',
                        'user.delete',
                        'user.activate',
                        'institute.create',
                        'institute.view',
                        'institute.update',
                        'institute.suspend',
                        'course.view',
                        'course.create',
                        'course.update',
                        'course.delete',
                        'course.publish',
                        'course_material.view',
                        'course_material.upload',
                        'course_material.delete',
                    ];
                    return [4 /*yield*/, prisma.permission.findMany({
                            where: {
                                name: {
                                    in: adminPermissionNames,
                                },
                            },
                        })];
                case 22:
                    adminPermissions = _d.sent();
                    _c = 0, adminPermissions_1 = adminPermissions;
                    _d.label = 23;
                case 23:
                    if (!(_c < adminPermissions_1.length)) return [3 /*break*/, 26];
                    permission = adminPermissions_1[_c];
                    return [4 /*yield*/, prisma.rolePermissionAssignment.upsert({
                            where: {
                                roleId_permissionId: {
                                    roleId: adminRole.id,
                                    permissionId: permission.id,
                                },
                            },
                            create: {
                                roleId: adminRole.id,
                                permissionId: permission.id,
                            },
                            update: {},
                        })];
                case 24:
                    _d.sent();
                    _d.label = 25;
                case 25:
                    _c++;
                    return [3 /*break*/, 23];
                case 26:
                    console.log("ADMIN granted ".concat(adminPermissions.length, " permissions"));
                    console.log('Database seed completed successfully');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (error) {
    console.error('seed failed:', error);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
