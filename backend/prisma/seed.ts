import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ODOO COMMUTE (Multiple Indian Scheduled & Completed Rides)...');

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

  console.log(`✓ Organization created: ${org.name} (${org.currency})`);

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 2. Create 11 Indian Employees & Admin
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

  const rahul = await prisma.user.upsert({
    where: { email: 'rahul.verma@odoo.demo' },
    update: { lastActiveAt: new Date() },
    create: {
      organizationId: org.id,
      email: 'rahul.verma@odoo.demo',
      passwordHash: defaultPasswordHash,
      fullName: 'Rahul Verma',
      role: 'EMPLOYEE',
      gender: 'MALE',
      department: 'Backend Engineering',
      phone: '+91 98220 11223',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      wallet: { create: { balance: 1800.0 } }
    }
  });

  const neha = await prisma.user.upsert({
    where: { email: 'neha.gupta@odoo.demo' },
    update: { lastActiveAt: new Date() },
    create: {
      organizationId: org.id,
      email: 'neha.gupta@odoo.demo',
      passwordHash: defaultPasswordHash,
      fullName: 'Neha Gupta',
      role: 'EMPLOYEE',
      gender: 'FEMALE',
      department: 'QA & Automation',
      phone: '+91 98220 22334',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      wallet: { create: { balance: 2100.0 } }
    }
  });

  // 3. Create Vehicles
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

  const rahulVehicle = await prisma.vehicle.upsert({
    where: { plateNumber: 'MH-31-AB-1234' },
    update: {},
    create: {
      userId: rahul.id,
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

  const nehaVehicle = await prisma.vehicle.upsert({
    where: { plateNumber: 'MH-31-CD-5678' },
    update: {},
    create: {
      userId: neha.id,
      organizationId: org.id,
      make: 'Hyundai',
      model: 'Creta SX',
      color: 'Titan Grey',
      plateNumber: 'MH-31-CD-5678',
      totalSeats: 4,
      fuelType: 'Diesel',
      mileageKmL: 19.0,
      isDefault: true,
    }
  });

  console.log('✓ Vehicles created');

  const nagpurPolyline = [
    [21.1524, 79.0888],
    [21.1505, 79.0835],
    [21.1478, 79.0760],
    [21.1445, 79.0675],
    [21.1418, 79.0596]
  ];

  // 4. Seed Multiple Scheduled Rides across Nagpur Routes
  const ridesToCreate = [
    {
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
      pricePerSeat: 40.0,
      estimatedFuelCost: 27.80,
      isWomenOnly: false,
      distanceKm: 4.8,
      durationMins: 14,
    },
    {
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
      pricePerSeat: 35.0,
      estimatedFuelCost: 13.12,
      isWomenOnly: true,
      distanceKm: 8.2,
      durationMins: 18,
    },
    {
      driverId: rahul.id,
      vehicleId: rahulVehicle.id,
      originName: 'Sitabuldi Square, Nagpur',
      originLat: 21.1458,
      originLng: 79.0882,
      destName: 'Odoo Tech Campus, Dharampeth, Nagpur',
      destLat: 21.1418,
      destLng: 79.0596,
      departureTime: new Date(Date.now() + 3600 * 1000 * 4),
      availableSeats: 3,
      totalSeats: 4,
      pricePerSeat: 30.0,
      estimatedFuelCost: 10.50,
      isWomenOnly: false,
      distanceKm: 3.5,
      durationMins: 10,
    },
    {
      driverId: neha.id,
      vehicleId: nehaVehicle.id,
      originName: 'Civil Lines, Nagpur',
      originLat: 21.1550,
      originLng: 79.0720,
      destName: 'Odoo Tech Campus, Dharampeth, Nagpur',
      destLat: 21.1418,
      destLng: 79.0596,
      departureTime: new Date(Date.now() + 3600 * 1000 * 5),
      availableSeats: 2,
      totalSeats: 4,
      pricePerSeat: 25.0,
      estimatedFuelCost: 12.00,
      isWomenOnly: true,
      distanceKm: 3.2,
      durationMins: 9,
    },
    {
      driverId: driverUser.id,
      vehicleId: driverVehicle.id,
      originName: 'Manish Nagar, Wardha Rd, Nagpur',
      originLat: 21.0920,
      originLng: 79.0610,
      destName: 'Odoo Tech Campus, Dharampeth, Nagpur',
      destLat: 21.1418,
      destLng: 79.0596,
      departureTime: new Date(Date.now() + 3600 * 1000 * 6),
      availableSeats: 3,
      totalSeats: 4,
      pricePerSeat: 45.0,
      estimatedFuelCost: 35.00,
      isWomenOnly: false,
      distanceKm: 9.5,
      durationMins: 22,
    }
  ];

  const createdRides = [];
  for (const r of ridesToCreate) {
    const ride = await prisma.ride.create({
      data: {
        organizationId: org.id,
        driverId: r.driverId,
        vehicleId: r.vehicleId,
        originName: r.originName,
        originLat: r.originLat,
        originLng: r.originLng,
        destName: r.destName,
        destLat: r.destLat,
        destLng: r.destLng,
        departureTime: r.departureTime,
        availableSeats: r.availableSeats,
        totalSeats: r.totalSeats,
        pricePerSeat: r.pricePerSeat,
        estimatedFuelCost: r.estimatedFuelCost,
        isWomenOnly: r.isWomenOnly,
        distanceKm: r.distanceKm,
        durationMins: r.durationMins,
        routePolyline: JSON.stringify(nagpurPolyline),
        status: 'SCHEDULED',
      }
    });
    createdRides.push(ride);
  }

  console.log(`✓ ${createdRides.length} Scheduled Indian Rides published across Nagpur!`);

  // 5. Active Trip
  const activeRide = createdRides[0];
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

  // 6. REAL COMPLETED SHARED TRIP FOR ACCURATE ENVIRONMENTAL & CARPOOL IMPACT
  const completedRide = await prisma.ride.create({
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
      departureTime: new Date(Date.now() - 86400 * 1000 * 2),
      availableSeats: 2,
      totalSeats: 4,
      pricePerSeat: 40.0,
      estimatedFuelCost: 27.80,
      isWomenOnly: false,
      distanceKm: 4.8,
      durationMins: 14,
      routePolyline: JSON.stringify(nagpurPolyline),
      status: 'COMPLETED',
    }
  });

  const completedBooking = await prisma.booking.create({
    data: {
      rideId: completedRide.id,
      passengerId: passengerUser.id,
      seatsBooked: 1,
      totalFare: 40.0,
      pickupName: 'Nagpur Railway Station',
      pickupLat: 21.1524,
      pickupLng: 79.0888,
      dropName: 'Odoo Tech Campus, Dharampeth',
      dropLat: 21.1418,
      dropLng: 79.0596,
      boardingOtp: '1122',
      isCheckedIn: true,
      status: 'CONFIRMED',
    }
  });

  await prisma.trip.create({
    data: {
      organizationId: org.id,
      rideId: completedRide.id,
      bookingId: completedBooking.id,
      driverId: driverUser.id,
      passengerId: passengerUser.id,
      status: 'COMPLETED',
      boardingOtp: '1122',
      isCheckedIn: true,
      startedAt: new Date(Date.now() - 86400 * 1000 * 2),
      completedAt: new Date(Date.now() - 86400 * 1000 * 2 + 14 * 60 * 1000),
      distanceKm: 4.8,
      fareAmount: 40.0,
      paymentStatus: 'PAYMENT_COMPLETED',
    }
  });

  console.log('✓ Seeded 1 Real Completed Shared Trip for verifiable carpool impact calculations');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
