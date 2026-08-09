import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ODOO COMMUTE (35-Employee Enterprise Dataset with Interconnected Activity)...');

  // 1. Create Main Enterprise Organization (Nagpur, Maharashtra, India)
  const org = await prisma.organization.upsert({
    where: { code: 'ODOO-INDIA' },
    update: {
      name: 'Odoo India Technologies Pvt. Ltd.',
      code: 'ODOO-INDIA',
      domain: 'odoo.in',
      petrolPricePerLiter: 101.50,
      dieselPricePerLiter: 92.00,
      cngPricePerKg: 78.00,
      evPricePerKwh: 12.00,
      travelAllowancePerKm: 12.00,
      currency: 'INR',
    },
    create: {
      name: 'Odoo India Technologies Pvt. Ltd.',
      code: 'ODOO-INDIA',
      domain: 'odoo.in',
      petrolPricePerLiter: 101.50,
      dieselPricePerLiter: 92.00,
      cngPricePerKg: 78.00,
      evPricePerKwh: 12.00,
      travelAllowancePerKm: 12.00,
      currency: 'INR',
    }
  });

  console.log(`✓ Organization initialized: ${org.name}`);

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 2. Primary Key Demo Personas
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@odoo.demo' },
    update: { lastActiveAt: new Date() },
    create: {
      organizationId: org.id,
      email: 'admin@odoo.demo',
      passwordHash: defaultPasswordHash,
      fullName: 'Victoria Sterling (Admin)',
      role: 'ADMINISTRATOR',
      gender: 'FEMALE',
      department: 'Corporate Operations',
      workLocation: 'Odoo Campus, Civil Lines, Nagpur',
      phone: '+91 98765 43210',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
      wallet: { create: { balance: 5000.0 } }
    }
  });

  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@odoo.demo' },
    update: { lastActiveAt: new Date() },
    create: {
      organizationId: org.id,
      email: 'driver@odoo.demo',
      passwordHash: defaultPasswordHash,
      fullName: 'Marcus Vance (Driver)',
      role: 'EMPLOYEE',
      gender: 'MALE',
      department: 'Engineering',
      workLocation: 'Odoo Tech Hub, Dharampeth',
      phone: '+91 98123 45678',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      wallet: { create: { balance: 2450.0 } }
    }
  });

  const femaleDriverUser = await prisma.user.upsert({
    where: { email: 'female.driver@odoo.demo' },
    update: { lastActiveAt: new Date() },
    create: {
      organizationId: org.id,
      email: 'female.driver@odoo.demo',
      passwordHash: defaultPasswordHash,
      fullName: 'Priya Sharma (Women-Only Driver)',
      role: 'EMPLOYEE',
      gender: 'FEMALE',
      department: 'Engineering',
      workLocation: 'Odoo Campus, Dharampeth',
      phone: '+91 97112 23344',
      avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200',
      wallet: { create: { balance: 3200.0 } }
    }
  });

  const passengerUser = await prisma.user.upsert({
    where: { email: 'employee@odoo.demo' },
    update: { lastActiveAt: new Date() },
    create: {
      organizationId: org.id,
      email: 'employee@odoo.demo',
      passwordHash: defaultPasswordHash,
      fullName: 'Elena Rostova (Passenger)',
      role: 'EMPLOYEE',
      gender: 'FEMALE',
      department: 'Design',
      workLocation: 'Odoo Campus, Dharampeth',
      phone: '+91 99887 76655',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      wallet: { create: { balance: 1500.0 } }
    }
  });

  // 3. Seed 31 Additional Realistic Indian Employees across 9 Departments
  const indianEmployeesData = [
    { name: 'Rahul Verma', email: 'rahul.verma@odoo.in', gender: 'MALE', dept: 'Engineering', balance: 1800.0, phone: '+91 98220 11223' },
    { name: 'Neha Gupta', email: 'neha.gupta@odoo.in', gender: 'FEMALE', dept: 'QA & Automation', balance: 2100.0, phone: '+91 98220 22334' },
    { name: 'Amit Patel', email: 'amit.patel@odoo.in', gender: 'MALE', dept: 'Operations', balance: 1450.0, phone: '+91 98220 33445' },
    { name: 'Ananya Roy', email: 'ananya.roy@odoo.in', gender: 'FEMALE', dept: 'Design', balance: 1950.0, phone: '+91 98220 44556' },
    { name: 'Vikram Singh', email: 'vikram.singh@odoo.in', gender: 'MALE', dept: 'Engineering', balance: 2800.0, phone: '+91 98220 55667' },
    { name: 'Siddharth Rao', email: 'siddharth.rao@odoo.in', gender: 'MALE', dept: 'IT Support', balance: 1600.0, phone: '+91 98220 66778' },
    { name: 'Kavita Reddy', email: 'kavita.reddy@odoo.in', gender: 'FEMALE', dept: 'Human Resources', balance: 2250.0, phone: '+91 98220 77889' },
    { name: 'Aditya Kulkarni', email: 'aditya.kulkarni@odoo.in', gender: 'MALE', dept: 'Finance', balance: 3100.0, phone: '+91 98220 88990' },
    { name: 'Sneha Deshmukh', email: 'sneha.deshmukh@odoo.in', gender: 'FEMALE', dept: 'Marketing', balance: 1750.0, phone: '+91 98220 99001' },
    { name: 'Tanvi Joshi', email: 'tanvi.joshi@odoo.in', gender: 'FEMALE', dept: 'Sales', balance: 2400.0, phone: '+91 98221 00112' },
    { name: 'Rohan Kulkarni', email: 'rohan.kulkarni@odoo.in', gender: 'MALE', dept: 'Engineering', balance: 1900.0, phone: '+91 98221 11223' },
    { name: 'Pooja Hegde', email: 'pooja.hegde@odoo.in', gender: 'FEMALE', dept: 'Administration', balance: 1350.0, phone: '+91 98221 22334' },
    { name: 'Amitabh Saxena', email: 'amitabh.saxena@odoo.in', gender: 'MALE', dept: 'Operations', balance: 2600.0, phone: '+91 98221 33445' },
    { name: 'Meera Nair', email: 'meera.nair@odoo.in', gender: 'FEMALE', dept: 'Human Resources', balance: 2050.0, phone: '+91 98221 44556' },
    { name: 'Karan Mehta', email: 'karan.mehta@odoo.in', gender: 'MALE', dept: 'Sales', balance: 1550.0, phone: '+91 98221 55667' },
    { name: 'Swati Iyer', email: 'swati.iyer@odoo.in', gender: 'FEMALE', dept: 'Finance', balance: 2750.0, phone: '+91 98221 66778' },
    { name: 'Nikhil Mahajan', email: 'nikhil.mahajan@odoo.in', gender: 'MALE', dept: 'Engineering', balance: 1850.0, phone: '+91 98221 77889' },
    { name: 'Deepika Sengupta', email: 'deepika.sengupta@odoo.in', gender: 'FEMALE', dept: 'Design', balance: 2150.0, phone: '+91 98221 88990' },
    { name: 'Varun Joshi', email: 'varun.joshi@odoo.in', gender: 'MALE', dept: 'IT Support', balance: 1400.0, phone: '+91 98221 99001' },
    { name: 'Ishaan Malhotra', email: 'ishaan.malhotra@odoo.in', gender: 'MALE', dept: 'Marketing', balance: 1650.0, phone: '+91 98222 00112' },
    { name: 'Ritu Kapur', email: 'ritu.kapur@odoo.in', gender: 'FEMALE', dept: 'QA & Automation', balance: 2300.0, phone: '+91 98222 11223' },
    { name: 'Alok Pandey', email: 'alok.pandey@odoo.in', gender: 'MALE', dept: 'Operations', balance: 2900.0, phone: '+91 98222 22334' },
    { name: 'Divya Nambiar', email: 'divya.nambiar@odoo.in', gender: 'FEMALE', dept: 'Engineering', balance: 1700.0, phone: '+91 98222 33445' },
    { name: 'Sandeep Bhatia', email: 'sandeep.bhatia@odoo.in', gender: 'MALE', dept: 'Sales', balance: 2500.0, phone: '+91 98222 44556' },
    { name: 'Pallavi Soni', email: 'pallavi.soni@odoo.in', gender: 'FEMALE', dept: 'Finance', balance: 2000.0, phone: '+91 98222 55667' },
    { name: 'Gaurav Choudhury', email: 'gaurav.choudhury@odoo.in', gender: 'MALE', dept: 'Engineering', balance: 2200.0, phone: '+91 98222 66778' },
    { name: 'Shweta Rastogi', email: 'shweta.rastogi@odoo.in', gender: 'FEMALE', dept: 'Marketing', balance: 1800.0, phone: '+91 98222 77889' },
    { name: 'Manish Tiwari', email: 'manish.tiwari@odoo.in', gender: 'MALE', dept: 'Operations', balance: 2450.0, phone: '+91 98222 88990' },
    { name: 'Ritika Sen', email: 'ritika.sen@odoo.in', gender: 'FEMALE', dept: 'Design', balance: 1900.0, phone: '+91 98222 99001' },
    { name: 'Naveen Kumar', email: 'naveen.kumar@odoo.in', gender: 'MALE', dept: 'IT Support', balance: 1300.0, phone: '+91 98223 00112' },
    { name: 'Preeti Agarwal', email: 'preeti.agarwal@odoo.in', gender: 'FEMALE', dept: 'Human Resources', balance: 2100.0, phone: '+91 98223 11223' },
  ];

  const seededEmployees: any[] = [adminUser, driverUser, femaleDriverUser, passengerUser];

  for (const emp of indianEmployeesData) {
    const u = await prisma.user.upsert({
      where: { email: emp.email },
      update: { lastActiveAt: new Date(Date.now() - Math.floor(Math.random() * 3600 * 1000 * 48)) },
      create: {
        organizationId: org.id,
        email: emp.email,
        passwordHash: defaultPasswordHash,
        fullName: emp.name,
        role: 'EMPLOYEE',
        gender: emp.gender,
        department: emp.dept,
        workLocation: 'Odoo Tech Hub, Dharampeth',
        phone: emp.phone,
        lastActiveAt: new Date(Date.now() - Math.floor(Math.random() * 3600 * 1000 * 48)),
        wallet: { create: { balance: emp.balance } }
      }
    });
    seededEmployees.push(u);
  }

  console.log(`✓ ${seededEmployees.length} Real Indian Employees seeded across 9 departments!`);

  // 4. Create Vehicles for Drivers
  const vehiclesToCreate = [
    { user: driverUser, plate: 'MH-31-FA-9021', make: 'Honda', model: 'City i-VTEC', color: 'Orchid White', seats: 4, fuel: 'Petrol', mileage: 17.5 },
    { user: femaleDriverUser, plate: 'MH-31-EV-8842', make: 'Tata', model: 'Nexon EV Max', color: 'Teal Blue', seats: 4, fuel: 'EV', mileage: 7.5 },
    { user: seededEmployees[4], plate: 'MH-31-AB-1234', make: 'Maruti', model: 'Swift ZXi', color: 'Magma Grey', seats: 4, fuel: 'CNG', mileage: 25.0 }, // Rahul Verma
    { user: seededEmployees[5], plate: 'MH-31-CD-5678', make: 'Hyundai', model: 'Creta SX', color: 'Titan Grey', seats: 4, fuel: 'Diesel', mileage: 19.0 }, // Neha Gupta
    { user: seededEmployees[8], plate: 'MH-31-EF-9012', make: 'Tata', model: 'Harrier XZ', color: 'Calypso Red', seats: 5, fuel: 'Diesel', mileage: 16.2 }, // Vikram Singh
    { user: seededEmployees[9], plate: 'MH-31-GH-3456', make: 'Mahindra', model: 'XUV700 AX7', color: 'Midnight Black', seats: 5, fuel: 'Petrol', mileage: 14.0 }, // Siddharth Rao
    { user: seededEmployees[13], plate: 'MH-31-JK-7890', make: 'Kia', model: 'Seltos GTX', color: 'Gravity Grey', seats: 4, fuel: 'Petrol', mileage: 16.5 }, // Tanvi Joshi
    { user: seededEmployees[11], plate: 'MH-31-LM-1234', make: 'Toyota', model: 'Urban Cruiser', color: 'Sunny White', seats: 4, fuel: 'Petrol', mileage: 18.0 }, // Aditya Kulkarni
    { user: seededEmployees[12], plate: 'MH-31-NP-5678', make: 'MG', model: 'ZS EV', color: 'Ferris White', seats: 4, fuel: 'EV', mileage: 7.2 }, // Sneha Deshmukh
    { user: seededEmployees[14], plate: 'MH-31-RS-9012', make: 'Honda', model: 'Amaze VX', color: 'Meteoroid Grey', seats: 4, fuel: 'Petrol', mileage: 18.5 }, // Rohan Kulkarni
  ];

  const seededVehicles: any[] = [];
  for (const v of vehiclesToCreate) {
    const vehicle = await prisma.vehicle.upsert({
      where: { plateNumber: v.plate },
      update: {},
      create: {
        userId: v.user.id,
        organizationId: org.id,
        make: v.make,
        model: v.model,
        color: v.color,
        plateNumber: v.plate,
        totalSeats: v.seats,
        fuelType: v.fuel,
        mileageKmL: v.mileage,
        isDefault: true,
      }
    });
    seededVehicles.push(vehicle);
  }

  console.log(`✓ ${seededVehicles.length} Registered Vehicles created with Indian License Plates!`);

  const nagpurPolyline = [
    [21.1524, 79.0888],
    [21.1505, 79.0835],
    [21.1478, 79.0760],
    [21.1445, 79.0675],
    [21.1418, 79.0596]
  ];

  // 5. Seed 25 COMPLETED Shared Rides across 25 Employees (Strictly within last 7 days: daysAgo 0 through 6)
  const completedRidesData = [
    // Today (0 days ago)
    { driver: driverUser, vehicle: seededVehicles[0], passenger: passengerUser, origin: 'Nagpur Railway Station', dest: 'Odoo Tech Campus, Dharampeth', dist: 4.8, fare: 40.0, daysAgo: 0 },
    { driver: femaleDriverUser, vehicle: seededVehicles[1], passenger: seededEmployees[5], origin: 'Wardha Road Tech Colony', dest: 'Odoo Tech Campus, Dharampeth', dist: 8.2, fare: 35.0, daysAgo: 0 },
    { driver: seededEmployees[4], vehicle: seededVehicles[2], passenger: seededEmployees[6], origin: 'Sitabuldi Square', dest: 'Odoo Tech Campus, Dharampeth', dist: 3.5, fare: 30.0, daysAgo: 0 },

    // Yesterday (1 day ago)
    { driver: seededEmployees[8], vehicle: seededVehicles[4], passenger: seededEmployees[7], origin: 'MIHAN IT Park', dest: 'Odoo Tech Campus, Dharampeth', dist: 12.4, fare: 65.0, daysAgo: 1 },
    { driver: seededEmployees[9], vehicle: seededVehicles[5], passenger: seededEmployees[10], origin: 'Civil Lines', dest: 'Odoo Tech Campus, Dharampeth', dist: 3.2, fare: 25.0, daysAgo: 1 },
    { driver: seededEmployees[13], vehicle: seededVehicles[6], passenger: seededEmployees[12], origin: 'Manish Nagar, Wardha Rd', dest: 'Odoo Tech Campus, Dharampeth', dist: 9.5, fare: 45.0, daysAgo: 1 },
    { driver: driverUser, vehicle: seededVehicles[0], passenger: seededEmployees[11], origin: 'Nagpur Railway Station', dest: 'Odoo Tech Campus, Dharampeth', dist: 4.8, fare: 40.0, daysAgo: 1 },

    // 2 days ago
    { driver: femaleDriverUser, vehicle: seededVehicles[1], passenger: seededEmployees[15], origin: 'Wardha Road Tech Colony', dest: 'Odoo Tech Campus, Dharampeth', dist: 8.2, fare: 35.0, daysAgo: 2 },
    { driver: seededEmployees[14], vehicle: seededVehicles[9], passenger: seededEmployees[16], origin: 'Hingna Road', dest: 'Odoo Tech Campus, Dharampeth', dist: 6.7, fare: 35.0, daysAgo: 2 },
    { driver: seededEmployees[8], vehicle: seededVehicles[4], passenger: seededEmployees[17], origin: 'Sadar Market', dest: 'Odoo Tech Campus, Dharampeth', dist: 4.1, fare: 30.0, daysAgo: 2 },
    { driver: seededEmployees[4], vehicle: seededVehicles[2], passenger: seededEmployees[18], origin: 'Pratap Nagar', dest: 'Odoo Tech Campus, Dharampeth', dist: 4.5, fare: 30.0, daysAgo: 2 },

    // 3 days ago
    { driver: driverUser, vehicle: seededVehicles[0], passenger: seededEmployees[19], origin: 'Trimurti Nagar', dest: 'Odoo Tech Campus, Dharampeth', dist: 5.2, fare: 35.0, daysAgo: 3 },
    { driver: femaleDriverUser, vehicle: seededVehicles[1], passenger: seededEmployees[20], origin: 'Wardha Road Tech Colony', dest: 'Odoo Tech Campus, Dharampeth', dist: 8.2, fare: 35.0, daysAgo: 3 },
    { driver: seededEmployees[5], vehicle: seededVehicles[3], passenger: seededEmployees[21], origin: 'Civil Lines', dest: 'Odoo Tech Campus, Dharampeth', dist: 3.2, fare: 25.0, daysAgo: 3 },
    { driver: seededEmployees[9], vehicle: seededVehicles[5], passenger: seededEmployees[22], origin: 'Sitabuldi Square', dest: 'Odoo Tech Campus, Dharampeth', dist: 3.5, fare: 30.0, daysAgo: 3 },

    // 4 days ago
    { driver: seededEmployees[13], vehicle: seededVehicles[6], passenger: seededEmployees[23], origin: 'Sadar Market', dest: 'Odoo Tech Campus, Dharampeth', dist: 4.1, fare: 30.0, daysAgo: 4 },
    { driver: seededEmployees[11], vehicle: seededVehicles[7], passenger: seededEmployees[24], origin: 'Hingna Road', dest: 'Odoo Tech Campus, Dharampeth', dist: 6.7, fare: 35.0, daysAgo: 4 },
    { driver: seededEmployees[12], vehicle: seededVehicles[8], passenger: seededEmployees[25], origin: 'Pratap Nagar', dest: 'Odoo Tech Campus, Dharampeth', dist: 4.5, fare: 30.0, daysAgo: 4 },
    { driver: seededEmployees[14], vehicle: seededVehicles[9], passenger: seededEmployees[26], origin: 'Manish Nagar', dest: 'Odoo Tech Campus, Dharampeth', dist: 9.5, fare: 45.0, daysAgo: 4 },

    // 5 days ago
    { driver: driverUser, vehicle: seededVehicles[0], passenger: seededEmployees[27], origin: 'Nagpur Railway Station', dest: 'Odoo Tech Campus, Dharampeth', dist: 4.8, fare: 40.0, daysAgo: 5 },
    { driver: femaleDriverUser, vehicle: seededVehicles[1], passenger: seededEmployees[28], origin: 'Wardha Road Tech Colony', dest: 'Odoo Tech Campus, Dharampeth', dist: 8.2, fare: 35.0, daysAgo: 5 },
    { driver: seededEmployees[4], vehicle: seededVehicles[2], passenger: seededEmployees[29], origin: 'Sitabuldi Square', dest: 'Odoo Tech Campus, Dharampeth', dist: 3.5, fare: 30.0, daysAgo: 5 },

    // 6 days ago
    { driver: seededEmployees[8], vehicle: seededVehicles[4], passenger: seededEmployees[30], origin: 'MIHAN IT Park', dest: 'Odoo Tech Campus, Dharampeth', dist: 12.4, fare: 65.0, daysAgo: 6 },
    { driver: seededEmployees[9], vehicle: seededVehicles[5], passenger: passengerUser, origin: 'Civil Lines', dest: 'Odoo Tech Campus, Dharampeth', dist: 3.2, fare: 25.0, daysAgo: 6 },
    { driver: seededEmployees[13], vehicle: seededVehicles[6], passenger: seededEmployees[5], origin: 'Sadar Market', dest: 'Odoo Tech Campus, Dharampeth', dist: 4.1, fare: 30.0, daysAgo: 6 },
  ];

  for (const cr of completedRidesData) {
    const depTime = new Date(Date.now() - 86400 * 1000 * cr.daysAgo);
    const ride = await prisma.ride.create({
      data: {
        organizationId: org.id,
        driverId: cr.driver.id,
        vehicleId: cr.vehicle.id,
        originName: cr.origin,
        originLat: 21.1524,
        originLng: 79.0888,
        destName: cr.dest,
        destLat: 21.1418,
        destLng: 79.0596,
        departureTime: depTime,
        availableSeats: 2,
        totalSeats: cr.vehicle.totalSeats,
        pricePerSeat: cr.fare,
        estimatedFuelCost: Number((cr.dist * 5.8).toFixed(2)),
        isWomenOnly: cr.driver.gender === 'FEMALE',
        distanceKm: cr.dist,
        durationMins: Math.round(cr.dist * 2.5),
        routePolyline: JSON.stringify(nagpurPolyline),
        status: 'COMPLETED',
      }
    });

    const booking = await prisma.booking.create({
      data: {
        rideId: ride.id,
        passengerId: cr.passenger.id,
        seatsBooked: 1,
        totalFare: cr.fare,
        pickupName: cr.origin,
        pickupLat: 21.1524,
        pickupLng: 79.0888,
        dropName: cr.dest,
        dropLat: 21.1418,
        dropLng: 79.0596,
        boardingOtp: '100' + cr.daysAgo,
        isCheckedIn: true,
        status: 'CONFIRMED',
      }
    });

    await prisma.trip.create({
      data: {
        organizationId: org.id,
        rideId: ride.id,
        bookingId: booking.id,
        driverId: cr.driver.id,
        passengerId: cr.passenger.id,
        status: 'COMPLETED',
        boardingOtp: '100' + cr.daysAgo,
        isCheckedIn: true,
        createdAt: depTime,
        startedAt: depTime,
        completedAt: new Date(depTime.getTime() + 15 * 60 * 1000),
        distanceKm: cr.dist,
        fareAmount: cr.fare,
        paymentStatus: 'PAYMENT_COMPLETED',
      }
    });
  }

  console.log(`✓ ${completedRidesData.length} COMPLETED Shared Trips seeded across 25 active employees within the 7-day window!`);

  // 6. Seed 10 SCHEDULED Upcoming Rides
  const upcomingRidesData = [
    { driver: driverUser, vehicle: seededVehicles[0], origin: 'Nagpur Railway Station, Feeder Rd', dest: 'Odoo Tech Campus, Dharampeth, Nagpur', seats: 3, price: 40.0, hours: 2, womenOnly: false },
    { driver: femaleDriverUser, vehicle: seededVehicles[1], origin: 'Wardha Road Tech Colony, Nagpur', dest: 'Odoo Tech Campus, Dharampeth, Nagpur', seats: 3, price: 35.0, hours: 3, womenOnly: true },
    { driver: seededEmployees[4], vehicle: seededVehicles[2], origin: 'Sitabuldi Square, Nagpur', dest: 'Odoo Tech Campus, Dharampeth, Nagpur', seats: 3, price: 30.0, hours: 4, womenOnly: false },
    { driver: seededEmployees[5], vehicle: seededVehicles[3], origin: 'Civil Lines, Nagpur', dest: 'Odoo Tech Campus, Dharampeth, Nagpur', seats: 2, price: 25.0, hours: 5, womenOnly: true },
    { driver: seededEmployees[8], vehicle: seededVehicles[4], origin: 'MIHAN IT Park, Nagpur', dest: 'Odoo Tech Campus, Dharampeth, Nagpur', seats: 4, price: 65.0, hours: 6, womenOnly: false },
    { driver: seededEmployees[9], vehicle: seededVehicles[5], origin: 'Manish Nagar, Wardha Rd, Nagpur', dest: 'Odoo Tech Campus, Dharampeth, Nagpur', seats: 3, price: 45.0, hours: 7, womenOnly: false },
    { driver: seededEmployees[13], vehicle: seededVehicles[6], origin: 'Sadar Market, Nagpur', dest: 'Odoo Tech Campus, Dharampeth, Nagpur', seats: 3, price: 30.0, hours: 8, womenOnly: true },
    { driver: seededEmployees[11], vehicle: seededVehicles[7], origin: 'Hingna Road, Nagpur', dest: 'Odoo Tech Campus, Dharampeth, Nagpur', seats: 3, price: 35.0, hours: 9, womenOnly: false },
    { driver: seededEmployees[12], vehicle: seededVehicles[8], origin: 'Pratap Nagar, Nagpur', dest: 'Odoo Tech Campus, Dharampeth, Nagpur', seats: 3, price: 30.0, hours: 10, womenOnly: true },
    { driver: seededEmployees[14], vehicle: seededVehicles[9], origin: 'Trimurti Nagar, Nagpur', dest: 'Odoo Tech Campus, Dharampeth, Nagpur', seats: 3, price: 35.0, hours: 12, womenOnly: false },
  ];

  const createdUpcomingRides = [];
  for (const r of upcomingRidesData) {
    const ride = await prisma.ride.create({
      data: {
        organizationId: org.id,
        driverId: r.driver.id,
        vehicleId: r.vehicle.id,
        originName: r.origin,
        originLat: 21.1524,
        originLng: 79.0888,
        destName: r.dest,
        destLat: 21.1418,
        destLng: 79.0596,
        departureTime: new Date(Date.now() + 3600 * 1000 * r.hours),
        availableSeats: r.seats,
        totalSeats: r.vehicle.totalSeats,
        pricePerSeat: r.price,
        estimatedFuelCost: 25.0,
        isWomenOnly: r.womenOnly,
        distanceKm: 5.2,
        durationMins: 15,
        routePolyline: JSON.stringify(nagpurPolyline),
        status: 'SCHEDULED',
      }
    });
    createdUpcomingRides.push(ride);
  }

  console.log(`✓ ${createdUpcomingRides.length} SCHEDULED Upcoming Commutes published for Find Ride & Dashboard!`);

  // 7. Seed 1 ACTIVE Trip (IN_PROGRESS) for Live Tracking Presentation
  const activeRide = createdUpcomingRides[0];
  const booking = await prisma.booking.create({
    data: {
      rideId: activeRide.id,
      passengerId: passengerUser.id,
      seatsBooked: 1,
      totalFare: 40.0,
      pickupName: 'Nagpur Railway Station',
      pickupLat: 21.1524,
      pickupLng: 79.0888,
      dropName: 'Odoo Tech Campus, Dharampeth',
      dropLat: 21.1418,
      dropLng: 79.0596,
      boardingOtp: '4829',
      isCheckedIn: true,
      status: 'CONFIRMED',
    }
  });

  const activeTrip = await prisma.trip.create({
    data: {
      organizationId: org.id,
      rideId: activeRide.id,
      bookingId: booking.id,
      driverId: driverUser.id,
      passengerId: passengerUser.id,
      status: 'IN_PROGRESS',
      boardingOtp: '4829',
      isCheckedIn: true,
      currentLat: 21.1478,
      currentLng: 79.0760,
      startedAt: new Date(Date.now() - 400 * 1000),
      distanceKm: 4.8,
      fareAmount: 40.0,
      paymentStatus: 'UNPAID',
    }
  });

  console.log(`✓ Active Live Trip created on Nagpur route (ID: ${activeTrip.id}, OTP: 4829)`);

  // 8. Saved Places
  await prisma.savedPlace.createMany({
    data: [
      { userId: passengerUser.id, label: 'Home', address: 'Sitabuldi Square, Nagpur, Maharashtra', lat: 21.1458, lng: 79.0882 },
      { userId: passengerUser.id, label: 'Office', address: 'Odoo Campus, Dharampeth, Nagpur', lat: 21.1418, lng: 79.0596 },
      { userId: driverUser.id, label: 'Home', address: 'Wardha Road, Manish Nagar, Nagpur', lat: 21.1032, lng: 79.0538 },
      { userId: driverUser.id, label: 'Office', address: 'Odoo Campus, Dharampeth, Nagpur', lat: 21.1418, lng: 79.0596 },
    ]
  });

  console.log('✅ ODOO COMMUTE 35-Employee Dataset Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
