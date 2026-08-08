"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting ODOO COMMUTE database seeding...');
    // 1. Create Main Enterprise Organization
    const org = await prisma.organization.upsert({
        where: { code: 'ODOO-GLOBAL' },
        update: {},
        create: {
            name: 'Odoo Global Technology Corp.',
            code: 'ODOO-GLOBAL',
            domain: 'odoo.demo',
            fuelRatePerKm: 0.14,
            travelAllowance: 0.25,
            currency: 'USD',
        }
    });
    console.log(`✓ Organization created: ${org.name}`);
    const defaultPasswordHash = await bcryptjs_1.default.hash('password123', 10);
    // 2. Create Users
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@odoo.demo' },
        update: {},
        create: {
            organizationId: org.id,
            email: 'admin@odoo.demo',
            passwordHash: defaultPasswordHash,
            fullName: 'Victoria Sterling (Admin)',
            role: 'ADMINISTRATOR',
            department: 'Corporate Mobility & Ops',
            workLocation: 'Odoo HQ Tower, San Francisco',
            avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
            wallet: { create: { balance: 500.0 } }
        }
    });
    const driverUser = await prisma.user.upsert({
        where: { email: 'driver@odoo.demo' },
        update: {},
        create: {
            organizationId: org.id,
            email: 'driver@odoo.demo',
            passwordHash: defaultPasswordHash,
            fullName: 'Marcus Vance (Driver)',
            role: 'EMPLOYEE',
            department: 'Principal Systems Architect',
            workLocation: 'Odoo R&D Center',
            phone: '+1 (555) 382-9102',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
            wallet: { create: { balance: 245.50 } }
        }
    });
    const passengerUser = await prisma.user.upsert({
        where: { email: 'employee@odoo.demo' },
        update: {},
        create: {
            organizationId: org.id,
            email: 'employee@odoo.demo',
            passwordHash: defaultPasswordHash,
            fullName: 'Elena Rostova (Passenger)',
            role: 'EMPLOYEE',
            department: 'Senior Product Designer',
            workLocation: 'Odoo HQ Tower',
            phone: '+1 (555) 918-2301',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
            wallet: { create: { balance: 120.00 } }
        }
    });
    // Additional roster employees
    const extraUsersData = [
        { name: 'Sarah Connor', email: 'sarah.c@odoo.demo', dept: 'Engineering' },
        { name: 'Alex Mercer', email: 'alex.m@odoo.demo', dept: 'Finance' },
        { name: 'Priya Sharma', email: 'priya.s@odoo.demo', dept: 'Marketing' },
        { name: 'David Kim', email: 'david.k@odoo.demo', dept: 'DevOps' },
        { name: 'Thomas Wright', email: 'thomas.w@odoo.demo', dept: 'Human Resources' },
    ];
    for (const u of extraUsersData) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                organizationId: org.id,
                email: u.email,
                passwordHash: defaultPasswordHash,
                fullName: u.name,
                role: 'EMPLOYEE',
                department: u.dept,
                workLocation: 'Odoo Campus',
                wallet: { create: { balance: 85.0 } }
            }
        });
    }
    console.log('✓ Demo Users created successfully');
    // 3. Create Vehicles
    const driverVehicle = await prisma.vehicle.upsert({
        where: { plateNumber: 'ODOO-EV-01' },
        update: {},
        create: {
            userId: driverUser.id,
            organizationId: org.id,
            make: 'Tesla',
            model: 'Model 3 Dual Motor',
            color: 'Pearl White',
            plateNumber: 'ODOO-EV-01',
            totalSeats: 4,
            isDefault: true,
        }
    });
    const secondaryVehicle = await prisma.vehicle.upsert({
        where: { plateNumber: 'ODOO-HY-02' },
        update: {},
        create: {
            userId: passengerUser.id,
            organizationId: org.id,
            make: 'Toyota',
            model: 'Camry Hybrid',
            color: 'Midnight Black',
            plateNumber: 'ODOO-HY-02',
            totalSeats: 4,
            isDefault: true,
        }
    });
    console.log('✓ Registered Vehicles created');
    // Route Polyline coords generator helper
    const samplePolyline = [
        [37.7749, -122.4194],
        [37.7795, -122.4140],
        [37.7830, -122.4080],
        [37.7885, -122.4020],
        [37.7920, -122.3980],
        [37.7955, -122.3937]
    ];
    // 4. Create Active Scheduled Rides
    const ride1 = await prisma.ride.create({
        data: {
            organizationId: org.id,
            driverId: driverUser.id,
            vehicleId: driverVehicle.id,
            originName: 'Downtown Residential Station (Market St)',
            originLat: 37.7749,
            originLng: -122.4194,
            destName: 'Odoo HQ Tech Campus (Financial District)',
            destLat: 37.7955,
            destLng: -122.3937,
            departureTime: new Date(Date.now() + 3600 * 1000 * 2), // in 2 hours
            availableSeats: 3,
            totalSeats: 4,
            pricePerSeat: 4.50,
            distanceKm: 8.4,
            durationMins: 18,
            routePolyline: JSON.stringify(samplePolyline),
            status: 'SCHEDULED',
        }
    });
    const ride2 = await prisma.ride.create({
        data: {
            organizationId: org.id,
            driverId: driverUser.id,
            vehicleId: driverVehicle.id,
            originName: 'Odoo HQ Tech Campus',
            originLat: 37.7955,
            originLng: -122.3937,
            destName: 'SFO Corporate Park Hub',
            destLat: 37.6213,
            destLng: -122.3790,
            departureTime: new Date(Date.now() + 3600 * 1000 * 8), // evening
            availableSeats: 2,
            totalSeats: 4,
            pricePerSeat: 6.00,
            distanceKm: 19.2,
            durationMins: 26,
            routePolyline: JSON.stringify(samplePolyline),
            status: 'SCHEDULED',
        }
    });
    console.log('✓ Active Rides published');
    // 5. Create a Booking & Active Trip for Live Demo Presentation!
    const booking = await prisma.booking.create({
        data: {
            rideId: ride1.id,
            passengerId: passengerUser.id,
            seatsBooked: 1,
            totalFare: 4.50,
            pickupName: 'Downtown Residential Station',
            pickupLat: 37.7749,
            pickupLng: -122.4194,
            dropName: 'Odoo HQ Tech Campus',
            dropLat: 37.7955,
            dropLng: -122.3937,
            status: 'CONFIRMED',
        }
    });
    const activeTrip = await prisma.trip.create({
        data: {
            organizationId: org.id,
            rideId: ride1.id,
            bookingId: booking.id,
            driverId: driverUser.id,
            passengerId: passengerUser.id,
            status: 'IN_PROGRESS',
            currentLat: 37.7830,
            currentLng: -122.4080,
            startedAt: new Date(Date.now() - 600 * 1000), // 10 mins ago
            distanceKm: 8.4,
            fareAmount: 4.50,
            paymentStatus: 'UNPAID',
        }
    });
    console.log(`✓ Active Trip created for Live Tracking Demo (ID: ${activeTrip.id})`);
    // 6. Saved Places
    await prisma.savedPlace.createMany({
        data: [
            { userId: passengerUser.id, label: 'Home', address: '742 Montgomery St, San Francisco, CA', lat: 37.7950, lng: -122.4030 },
            { userId: passengerUser.id, label: 'Office', address: 'Odoo HQ Campus, Financial Dist', lat: 37.7955, lng: -122.3937 },
            { userId: driverUser.id, label: 'Home', address: '120 Mission St, San Francisco, CA', lat: 37.7910, lng: -122.3960 },
            { userId: driverUser.id, label: 'Office', address: 'Odoo HQ Campus', lat: 37.7955, lng: -122.3937 },
        ]
    });
    // 7. Notifications
    await prisma.notification.createMany({
        data: [
            { userId: passengerUser.id, title: 'Commute Confirmed', message: 'Your seat with Marcus Vance (Tesla Model 3) is locked.', type: 'BOOKING' },
            { userId: passengerUser.id, title: 'Trip In Progress', message: 'Marcus has started the trip! View live tracking.', type: 'TRIP_STARTED' },
            { userId: driverUser.id, title: 'Passenger Joined', message: 'Elena Rostova booked 1 seat on your morning commute.', type: 'BOOKING' },
        ]
    });
    // 8. Chat Messages
    await prisma.message.createMany({
        data: [
            { tripId: activeTrip.id, senderId: driverUser.id, content: 'Hi Elena! I am waiting near the main entrance marker.' },
            { tripId: activeTrip.id, senderId: passengerUser.id, content: 'Great, walking down right now! See you in 1 minute.' },
        ]
    });
    console.log('✅ ODOO COMMUTE Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
