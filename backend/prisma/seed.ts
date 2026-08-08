import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ODOO COMMUTE (India-First Nagpur & Corporate Roster)...');

  // 1. Create Main Enterprise Organization (Nagpur, Maharashtra, India)
  const org = await prisma.organization.upsert({
    where: { code: 'ODOO-INDIA' },
    update: {
      name: 'Odoo India Technologies Pvt. Ltd.',
      code: 'ODOO-INDIA',
      domain: 'odoo.in',
      petrolPricePerLiter: 101.50, // Nagpur petrol ₹101.50/L
      dieselPricePerLiter: 92.00,  // Nagpur diesel ₹92.00/L
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

  console.log(`✓ Organization created: ${org.name} (${org.currency})`);

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 2. Create 10+ Indian Employees & Admin
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
      department: 'Corporate Mobility & Operations',
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
      department: 'Principal Systems Architect',
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
      department: 'Senior Engineering Manager',
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
      department: 'Senior Product Designer',
      workLocation: 'Odoo Campus, Dharampeth',
      phone: '+91 99887 76655',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      wallet: { create: { balance: 1500.0 } }
    }
  });

  // Additional 7 Indian Employees to make 11 total roster entries
  const additionalEmployees = [
    { email: 'rahul.verma@odoo.demo', name: 'Rahul Verma', role: 'EMPLOYEE', gender: 'MALE', dept: 'Backend Engineering', phone: '+91 98220 11223' },
    { email: 'neha.gupta@odoo.demo', name: 'Neha Gupta', role: 'EMPLOYEE', gender: 'FEMALE', dept: 'QA & Automation', phone: '+91 98220 22334' },
    { email: 'amit.patel@odoo.demo', name: 'Amit Patel', role: 'EMPLOYEE', gender: 'MALE', dept: 'DevOps & Infra', phone: '+91 98220 33445' },
    { email: 'ananya.roy@odoo.demo', name: 'Ananya Roy', role: 'EMPLOYEE', gender: 'FEMALE', dept: 'UI/UX Design', phone: '+91 98220 44556' },
    { email: 'vikram.singh@odoo.demo', name: 'Vikram Singh', role: 'EMPLOYEE', gender: 'MALE', dept: 'Mobile Engineering', phone: '+91 98220 55667' },
    { email: 'siddharth.rao@odoo.demo', name: 'Siddharth Rao', role: 'EMPLOYEE', gender: 'MALE', dept: 'Data Science', phone: '+91 98220 66778' },
    { email: 'kavita.reddy@odoo.demo', name: 'Kavita Reddy', role: 'EMPLOYEE', gender: 'FEMALE', dept: 'Product Management', phone: '+91 98220 77889' },
  ];

  for (const emp of additionalEmployees) {
    await prisma.user.upsert({
      where: { email: emp.email },
      update: { lastActiveAt: new Date(Date.now() - Math.random() * 600 * 1000) },
      create: {
        organizationId: org.id,
        email: emp.email,
        passwordHash: defaultPasswordHash,
        fullName: emp.name,
        role: emp.role,
        gender: emp.gender,
        department: emp.dept,
        workLocation: 'Odoo Tech Hub, Nagpur',
        phone: emp.phone,
        wallet: { create: { balance: 1000.0 } }
      }
    });
  }

  console.log('✓ Demo Indian Users & 11 Roster Entries Created');

  // 3. Create Registered Vehicles (Indian Registration Numbers)
  const driverVehicle = await prisma.vehicle.upsert({
    where: { plateNumber: 'MH-31-FA-9021' },
    update: {},
    create: {
      userId: driverUser.id,
      organizationId: org.id,
      make: 'Honda',
      model: 'City i-VTEC',
      color: 'Orchid White',
      plateNumber: 'MH-31-FA-9021',
      totalSeats: 4,
      fuelType: 'Petrol',
      mileageKmL: 17.5,
      isDefault: true,
    }
  });

  const femaleDriverVehicle = await prisma.vehicle.upsert({
    where: { plateNumber: 'MH-31-EV-8842' },
    update: {},
    create: {
      userId: femaleDriverUser.id,
      organizationId: org.id,
      make: 'Tata',
      model: 'Nexon EV Max',
      color: 'Teal Blue',
      plateNumber: 'MH-31-EV-8842',
      totalSeats: 4,
      fuelType: 'EV',
      mileageKmL: 7.5,
      isDefault: true,
    }
  });

  const rahulVehicle = await prisma.user.findUnique({ where: { email: 'rahul.verma@odoo.demo' } });
  if (rahulVehicle) {
    await prisma.vehicle.upsert({
      where: { plateNumber: 'MH-31-AB-1234' },
      update: {},
      create: {
        userId: rahulVehicle.id,
        organizationId: org.id,
        make: 'Maruti',
        model: 'Swift ZXi',
        color: 'Magma Grey',
        plateNumber: 'MH-31-AB-1234',
        totalSeats: 4,
        fuelType: 'CNG',
        mileageKmL: 25.0,
        isDefault: true,
      }
    });
  }

  console.log('✓ Indian registered vehicles seeded');

  // Realistic Polyline coordinates along Nagpur route (Nagpur Railway Station -> Sitabuldi -> Dharampeth)
  const nagpurPolyline = [
    [21.1524, 79.0888], // Nagpur Railway Station
    [21.1505, 79.0835], // Feeder Road
    [21.1478, 79.0760], // Sitabuldi Square
    [21.1445, 79.0675], // Law College Square
    [21.1418, 79.0596]  // Dharampeth Tech Campus
  ];

  // 4. Create Scheduled Commutes on Primary Indian Demo Route
  const ride1 = await prisma.ride.create({
    data: {
      organizationId: org.id,
      driverId: driverUser.id,
      vehicleId: driverVehicle.id,
      originName: 'Nagpur Railway Station, Feeder Rd',
      originLat: 21.1524,
      originLng: 79.0888,
      destName: 'Odoo Tech Campus, Dharampeth, Nagpur',
      destLat: 21.1418,
      destLng: 79.0596,
      departureTime: new Date(Date.now() + 3600 * 1000 * 2),
      availableSeats: 3,
      totalSeats: 4,
      pricePerSeat: 40.0, // ₹40 / seat
      estimatedFuelCost: 27.80, // 4.8 km * (₹101.50 / 17.5 km/L) = ₹27.80
      isWomenOnly: false,
      distanceKm: 4.8,
      durationMins: 14,
      routePolyline: JSON.stringify(nagpurPolyline),
      status: 'SCHEDULED',
    }
  });

  const womenOnlyRide = await prisma.ride.create({
    data: {
      organizationId: org.id,
      driverId: femaleDriverUser.id,
      vehicleId: femaleDriverVehicle.id,
      originName: 'Wardha Road Tech Colony, Nagpur',
      originLat: 21.1032,
      originLng: 79.0538,
      destName: 'Odoo Tech Campus, Dharampeth, Nagpur',
      destLat: 21.1418,
      destLng: 79.0596,
      departureTime: new Date(Date.now() + 3600 * 1000 * 3),
      availableSeats: 3,
      totalSeats: 4,
      pricePerSeat: 35.0, // ₹35 / seat
      estimatedFuelCost: 13.12, // EV 8.2 km * (₹12 / 7.5 kWh) = ₹13.12
      isWomenOnly: true, // 🔒 WOMEN ONLY RIDE
      distanceKm: 8.2,
      durationMins: 18,
      routePolyline: JSON.stringify(nagpurPolyline),
      status: 'SCHEDULED',
    }
  });

  console.log('✓ Active Indian Rides & Women-Only Ride published');

  // 5. Booking & Active Trip with Boarding OTP (e.g. 4829)
  const booking = await prisma.booking.create({
    data: {
      rideId: ride1.id,
      passengerId: passengerUser.id,
      seatsBooked: 1,
      totalFare: 40.0, // ₹40
      pickupName: 'Nagpur Railway Station',
      pickupLat: 21.1524,
      pickupLng: 79.0888,
      dropName: 'Odoo Tech Campus, Dharampeth',
      dropLat: 21.1418,
      dropLng: 79.0596,
      boardingOtp: '4829', // Boarding OTP for passenger check-in
      isCheckedIn: true,
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
      boardingOtp: '4829',
      isCheckedIn: true,
      currentLat: 21.1478,
      currentLng: 79.0760, // Currently near Sitabuldi Square, Nagpur!
      startedAt: new Date(Date.now() - 400 * 1000),
      distanceKm: 4.8,
      fareAmount: 40.0,
      paymentStatus: 'UNPAID',
    }
  });

  console.log(`✓ Active Trip created on Nagpur route (ID: ${activeTrip.id}, Boarding OTP: 4829)`);

  // 6. Saved Places in Nagpur
  await prisma.savedPlace.createMany({
    data: [
      { userId: passengerUser.id, label: 'Home', address: 'Sitabuldi Square, Nagpur, Maharashtra', lat: 21.1458, lng: 79.0882 },
      { userId: passengerUser.id, label: 'Office', address: 'Odoo Campus, Dharampeth, Nagpur', lat: 21.1418, lng: 79.0596 },
      { userId: driverUser.id, label: 'Home', address: 'Wardha Road, Manish Nagar, Nagpur', lat: 21.1032, lng: 79.0538 },
      { userId: driverUser.id, label: 'Office', address: 'Odoo Campus, Dharampeth, Nagpur', lat: 21.1418, lng: 79.0596 },
    ]
  });

  // 7. Notifications
  await prisma.notification.createMany({
    data: [
      { userId: passengerUser.id, title: 'Nagpur Commute Confirmed', message: 'Your seat with Marcus Vance (Honda City) is confirmed. Your Boarding OTP is 4829.', type: 'BOOKING' },
      { userId: femaleDriverUser.id, title: 'Women-Only Commute Live', message: 'Your Women-Only ride from Wardha Road to Dharampeth is active.', type: 'RIDE_OFFER' }
    ]
  });

  // 8. Chat Messages
  await prisma.message.createMany({
    data: [
      { tripId: activeTrip.id, senderId: driverUser.id, content: 'Namaste Elena! Waiting near Nagpur Railway Station Gate 1.' },
      { tripId: activeTrip.id, senderId: passengerUser.id, content: 'Great, coming down from platform exit now! OTP is 4829.' }
    ]
  });

  console.log('✅ ODOO COMMUTE India-First Nagpur Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
