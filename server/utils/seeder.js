const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Venue = require('../models/Venue');
const ArtistProfile = require('../models/ArtistProfile');
const Performance = require('../models/Performance');
const Event = require('../models/Event');
const Transaction = require('../models/Transaction');
const Ticket = require('../models/Ticket');

// --- Static Data Definitions ---

const users = [
  { username: 'admin', password: '2222', userType: 'admin' },
  // Distributors
  { username: 'distributor1', password: '2222', userType: 'distributor' },
  { username: 'distributor2', password: '2222', userType: 'distributor' },
  { username: 'distributor3', password: '2222', userType: 'distributor' },
  { username: 'distributor4', password: '2222', userType: 'distributor' },
  // Customers
  { username: 'customer1', password: '2222', userType: 'customer', _region: 'DC' },
  { username: 'customer2', password: '2222', userType: 'customer', _region: 'NY' },
  { username: 'customer3', password: '2222', userType: 'customer', _region: 'FL' },
  { username: 'customer4', password: '2222', userType: 'customer', _region: 'CA' },
  // Artists
  { username: 'maup', password: '2222', userType: 'artist', _name: 'Mau P', _dist: 'distributor1', _bio: 'Maurits Jan Westveen, known by his stage name Mau P, is a Dutch DJ and producer. Formerly known as Maurice West, he, since 2022, has been producing and playing electronic music predominantly in the house and techno genre.', _img: 'https://i.scdn.co/image/ab6761610000e5ebc494c9e97f2c6ee7560db705' },
  { username: 'fisher', password: '2222', userType: 'artist', _name: 'FISHER', _dist: 'distributor1', _bio: 'Paul Nicholas Fisher, known by the stage name and last name Fisher, is an Australian music producer. He has been nominated for several awards, including ARIA Music Awards, Grammy Awards and Ranked the No. 7 on top 100 DJ Mag in 2025.', _img: 'https://d3vhc53cl8e8km.cloudfront.net/artists/2694/8be5c83e-2daa-11ef-954e-0ecc81f4ee58.jpg' },
  { username: 'skilah', password: '2222', userType: 'artist', _name: 'SKILAH', _dist: 'distributor2', _bio: 'make me sweat', _img: 'https://hoobe-creator-dashboard-images-prod.drive-hoo.com/67ae65321760091f65a2fc31/8dbe11a4-298f-4486-ac2a-4cc22ee2ffda.webp?v=1756714369406' },
  { username: 'lostkings', password: '2222', userType: 'artist', _name: 'Lost Kings', _dist: 'distributor2', _bio: 'Lost Kings are an American DJ duo consisting of Robert Abisi and Nick Shanholtz, based in Los Angeles.', _img: 'https://s1.ticketm.net/dam/a/08c/df4cf251-b072-4084-8ec1-d66e3bef708c_1436841_RETINA_PORTRAIT_3_2.jpg' },
  { username: 'tsunami', password: '2222', userType: 'artist', _name: 'Tsu Nami', _dist: 'distributor2', _bio: 'Tsu Nami is a producer based in Los Angeles, CA. Her unique blend of dance music and electronic influence can be heard throughout her originals, and in 2022 she released her debut EP Ethereal on bitbird.', _img: 'https://d3vhc53cl8e8km.cloudfront.net/hello-staging/wp-content/uploads/2021/11/13010207/631dc992-f129-11ed-b991-0ee6b8365494-972x597.jpg' },
  { username: 'clake', password: '2222', userType: 'artist', _name: 'Chris Lake', _dist: 'distributor3', _bio: 'Chris Lake is an English electronic dance music producer and DJ. He rose to fame in 2006 with his hit single, "Changes", featuring Laura V. He is a member of Under Construction with Fisher, and also a member of Anti Up with Chris Lorenzo.', _img: 'https://d3vhc53cl8e8km.cloudfront.net/hello-staging/wp-content/uploads/2014/05/30000400/4c1d5dd8-6663-11ef-954e-0ecc81f4ee58-972x597.jpg' },
  { username: 'azzecca', password: '2222', userType: 'artist', _name: 'Azzecca', _dist: 'distributor3', _bio: 'Azzecca\'s love for house, techno and the darker sides of dance and disco drive her both as a DJ and producer. Through her distinctive DJ style and thoughtful selections, Azzecca has a unique ability to take crowds on unexpected journeys through genres and emotions, leaving nothing to be desired at the end of her sets.', _img: 'https://assets.beatportal.com/images/transforms/content-item/_2132x1200_crop_center-center_none/1167696/Azzecca-Cosimea-Sounds-BP.webp' },
  { username: 'hntr', password: '2222', userType: 'artist', _name: 'HNTR', _dist: 'distributor3', _bio: 'Juno Award Winning producer, DJ, event curator and label head @ No Neon.', _img: 'https://static.ra.co/images/profiles/square/hntr.jpg?dateUpdated=1603186918000' },
  { username: 'chuu', password: '2222', userType: 'artist', _name: 'CHUU', _dist: 'distributor4', _bio: 'Kim Ji-woo, known professionally as Chuu (츄), is a South Korean singer and actress. She is a former member of the South Korean girl group Loona and its sub-unit, yyxy.', _img: 'https://i.cdn.newsbytesapp.com/images/2305921716348846.jpeg' },
  { username: 'kai', password: '2222', userType: 'artist', _name: 'KAI', _dist: 'distributor4', _bio: 'Kim Jong-in, known professionally as Kai (카이), is a South Korean singer, actor, and dancer. He is a member of the South Korean boy band Exo, its subunit Exo-K, and South Korean supergroup SuperM.', _img: 'https://kingchoice.me/media/CACHE/images/exo_kai/a081915bfae271e764426991d2b1e4f6.jpg' },
  { username: 'twice', password: '2222', userType: 'artist', _name: 'TWICE', _dist: 'distributor4', _bio: 'Twice is a South Korean girl group formed by JYP Entertainment. The group is composed of nine members: Nayeon, Jeongyeon, Momo, Sana, Jihyo, Mina, Dahyun, Chaeyoung, and Tzuyu. Twice was formed under the television program Sixteen (2015) and debuted on October 20, 2015, with the extended play (EP) The Story Begins, and has received the honorific title of "The Nation\'s Girl Group" in their home country.', _img: 'https://variety.com/wp-content/uploads/2023/03/twice.jpg?w=1000&h=563&crop=1' },
  { username: 'blackpink', password: '2222', userType: 'artist', _name: 'BLACKPINK', _dist: 'distributor4', _bio: 'Blackpink is a South Korean girl group formed by YG Entertainment. The group is composed of four members: Jisoo, Jennie, Rosé, and Lisa. Regarded by various publications as the "biggest girl group in the world", they are recognized as a leading force in the Korean Wave and an ambassador of the "girl crush" concept in K-pop, which explores themes of self-confidence and female empowerment.', _img: 'https://d.ibtimes.com/en/full/4473796/blackpink.jpg?w=736&f=bc26c490c3fbd769b73593c9e563ed78' },
  { username: 'lsserafim', password: '2222', userType: 'artist', _name: 'LE SSERAFIM', _dist: 'distributor4', _bio: 'LE SSERAFIM is a South Korean girl group formed by Source Music, a sub-label of Hybe. The group consists of five members: Sakura, Kim Chaewon, Huh Yunjin, Kazuha, and Hong Eunchae. Originally a sextet ensemble, member Kim Garam departed from the group in July 2022.', _img: 'https://www.cultura.id/wp-content/uploads/2022/05/Le-Sserafim.jpg' },
];

const venues = [
  { name: "Echostage", address: "2135 Queens Chapel Rd NE", city: "Washington", state: "DC", zip: "20018", capacity: 3000 },
  { name: "Soundcheck", address: "1420 K St NW", city: "Washington", state: "DC", zip: "20005", capacity: 500 },
  { name: "Capitol One Arena", address: "601 F St NW", city: "Washington", state: "DC", zip: "20004", capacity: 5000 },
  { name: "LIV Nightclub Miami", address: "4441 Collins Ave", city: "Miami Beach", state: "FL", zip: "33140", capacity: 1000 },
  { name: "CLUB SPACE", address: "34 NE 11th St", city: "Miami", state: "FL", zip: "33132", capacity: 1500 },
  { name: "Aero Rooftop Bar & Lounge", address: "60 N Orange Ave", city: "Orlando", state: "FL", zip: "32801", capacity: 750 },
  { name: "Hard Rock Stadium", address: "347 Don Shula Dr", city: "Miami Gardens", state: "FL", zip: "33056", capacity: 6000 },
  { name: "Marquee New York", address: "289 10th Ave", city: "New York", state: "NY", zip: "10001", capacity: 600 },
  { name: "House of Yes", address: "2 Wyckoff Ave", city: "Brooklyn", state: "NY", zip: "11237", capacity: 500 },
  { name: "Yankee Stadium", address: "1 E 161st St", city: "Bronx", state: "NY", zip: "10451", capacity: 5000 },
  { name: "The Valencia Room", address: "647 Valencia St", city: "San Francisco", state: "CA", zip: "94110", capacity: 400 },
  { name: "Underground SF", address: "424 Haight St", city: "San Francisco", state: "CA", zip: "94117", capacity: 300 },
  { name: "Oracle Park", address: "24 Willie Mays Plaza", city: "San Francisco", state: "CA", zip: "94107", capacity: 4200 },
];

// --- Seeding Logic ---

const clearDatabase = async () => {
  await Promise.all([
    Ticket.deleteMany({}),
    Transaction.deleteMany({}),
    Event.deleteMany({}),
    Performance.deleteMany({}),
    ArtistProfile.deleteMany({}),
    Venue.deleteMany({}),
    User.deleteMany({})
  ]);
};

const seedDatabase = async () => {
  console.log('Starting Database Seed...');
  const start = Date.now();

  // CREATE USERS

  // Pre-hashing password once to save time
  // The password for all users is '2222' for simplicity
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('2222', salt);

  const userDocs = users.map(u => ({
    username: u.username,
    password: hashedPassword,
    userType: u.userType,
    // Store extra metadata for later use in memory (not in DB schema)
    _meta: { _region: u._region, _name: u._name, _dist: u._dist, _bio: u._bio, _img: u._img, _tier: u._tier }
  }));

  const createdUsers = await User.insertMany(userDocs);
  // Map username -> User Document for easy lookup
  const userMap = {};
  createdUsers.forEach((u, index) => {
    userMap[u.username] = { ...u.toObject(), ...userDocs[index]._meta };
  });

  // CREATE VENUES
  const createdVenues = await Venue.insertMany(venues);
  const venuesByState = {};
  createdVenues.forEach(v => {
    if (!venuesByState[v.state]) venuesByState[v.state] = [];
    venuesByState[v.state].push(v);
  });

  // SEED ARTIST PROFILES AND THEIR PERFORMANCES
  const artistUsers = users.filter(u => u.userType === 'artist');
  const profileDocs = [];
  const performanceDocs = [];

  // I define some of the artists' top hits for performance naming
  const topHits = {
    'Mau P': ['TESLA', 'Drugs From Amsterdam'],
    'FISHER': ['TAKE IT OFF', 'Losing It', 'Stay'],
    'SKILAH': ['Earthquake', 'Off My High'],
    'Lost Kings': ['PROMISES', 'INSOMNIA'],
    'Tsu Nami': ['eye2eye'],
    'Chris Lake': ['Chemistry', 'LA NOCHE'],
    'Azzecca': ['Forget', 'Forbidden Fruit'],
    'HNTR': ['Stephanie', 'Shook Ones, PT.III'],
    'CHUU': ['Kiss a kitty', 'Strawberry Rush'],
    'KAI': ['Mmmh', 'Rover'],
    'TWICE': ['TAKEDOWN', 'THIS IS FOR'],
    'BLACKPINK': ['BORN PINK', 'Kill This Love', 'How You Like That'],
    'LE SSERAFIM': ['SPAGHETTI', 'UNFORGIVEN']
  };

  // Generate Profiles
  for (const artistData of artistUsers) {
    const user = userMap[artistData.username];
    const profileId = new mongoose.Types.ObjectId();
    
    profileDocs.push({
      _id: profileId,
      user: user._id,
      artistName: artistData._name,
      bio: artistData._bio,
      imageUrl: artistData._img
    });

    // Generate Performances for this profile
    const hits = topHits[artistData._name] || [];
    for (let hit of hits) {
      performanceDocs.push({
        artistProfile: profileId,
        performanceName: `${artistData._name} - ${hit} Tour`,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        isActive: true,
        // Carry over distributor info for next step
        _distributor: artistData._dist 
      });
    }
  }

  await ArtistProfile.insertMany(profileDocs);
  const createdPerformances = await Performance.insertMany(performanceDocs);

  // CREATE EVENTS
  const eventDocs = [];
  
  for (const perf of createdPerformances) {
    // Find original config to get distributor
    const originalPerfConfig = performanceDocs.find(p => p.performanceName === perf.performanceName);
    const distributorUser = userMap[originalPerfConfig._distributor];
    
    // 6 to 24 events per performance
    const numEvents = Math.floor(Math.random() * 19) + 6;
    
    for (let i = 0; i < numEvents; i++) {
      const month = Math.floor(Math.random() * 12);
      const day = 1 + Math.floor(Math.random() * 28);
      
      // Select Venue
      const randomState = ['DC', 'NY', 'FL', 'CA'][Math.floor(Math.random() * 4)];
      const randomVenue = venuesByState[randomState][Math.floor(Math.random() * venuesByState[randomState].length)];

      // --- LOGIC FOR DURATION AND START TIME ---
      
      // Duration: 3 hours (180 mins) to 5 hours (300 mins)
      const durationMinutes = 180 + Math.floor(Math.random() * 121); 

      let startHour, startMinute;
      
      // Check if venue is a Stadium/Arena/Park
      const isBigVenue = randomVenue.name.includes('Stadium') || 
                         randomVenue.name.includes('Arena') || 
                         randomVenue.name.includes('Park');

      // We shift generated times by +5 hours so they appear as evening times 
      // in US Timezones (EST) when stored as UTC.
      // e.g. 21:00 EST -> 02:00 UTC (Next Day)
      const tzOffset = 5;

      if (isBigVenue) {
        // Stadiums: Aim for 6:00 PM local (18:00)
        // Base range: 17:00 - 18:00
        startHour = 17 + Math.floor(Math.random() * 2) + tzOffset; 
        startMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
        
        // Bias towards 18:00 local (23:00 UTC)
        if (Math.random() > 0.3) {
            startHour = 18 + tzOffset;
            startMinute = Math.random() < 0.5 ? 0 : 30; 
        }
      } else {
        // Clubs/Halls: Average 10:00 PM local (22:00), Earliest 9:00 PM (21:00)
        // Range: 21:00 to 23:00
        startHour = 21 + Math.floor(Math.random() * 3) + tzOffset; 
        startMinute = Math.floor(Math.random() * 4) * 15;
      }
      
      // Use Date.UTC to ensure strict UTC values are stored
      const startDateTime = new Date(Date.UTC(2025, month, day, startHour, startMinute, 0));
      const endDateTime = new Date(startDateTime.getTime() + (durationMinutes * 60000));

      // Generate price with cents (e.g., 30.50, 45.99)
      const price = parseFloat((30 + Math.random() * 60).toFixed(2));
      
      eventDocs.push({
        _id: new mongoose.Types.ObjectId(), // Generate ID now for linking
        performance: perf._id,
        venue: randomVenue._id,
        distributor: distributorUser._id,
        startDateTime,
        endDateTime,
        status: 'approved',
        ticketPrice: price,
        ticketsSold: 0, // Will update later
        // Metadata for transaction generation
        _region: randomState,
        _capacity: randomVenue.capacity,
        _isStadium: isBigVenue // Track stadium status for sales logic
      });
    }
  }

  // I insert the events immediately to get IDs for transactions
  const createdEvents = await Event.insertMany(eventDocs);

  // CREATE TRANSACTIONS & GENERATE TICKET QRCODES
  const customersByRegion = {};
  users.filter(u => u.userType === 'customer').forEach(c => {
    customersByRegion[c._region] = userMap[c.username]._id;
  });

  const transactionBatch = [];
  const ticketBatch = [];
  const eventUpdates = {}; // Map eventId -> totalSold

  for (const event of eventDocs) {
    const customerId = customersByRegion[event._region];
    if (!customerId) continue;

    let targetPercentage;
    if (event._isStadium) {
        // Stadiums: 35% to 100% sold (Average ~67.5%)
        targetPercentage = 0.35 + (Math.random() * 0.65);
    } else {
        // Clubs/Small venues: 85% to 100% sold
        targetPercentage = 0.85 + (Math.random() * 0.15);
    }

    const targetSales = Math.floor(event._capacity * targetPercentage);
    
    let currentSold = 0;

    // To prevent infinite loops or huge arrays if capacity is massive, I limit the batch
    while (currentSold < targetSales) {
      let quantity = 2 + Math.floor(Math.random() * 7);
      if (currentSold + quantity > targetSales) {
        quantity = targetSales - currentSold;
      }

      const daysBefore = 1 + Math.floor(Math.random() * 90);
      let purchaseDate = new Date(new Date(event.startDateTime).getTime() - (daysBefore * 24 * 60 * 60 * 1000));
      if (purchaseDate.getFullYear() < 2025) purchaseDate = new Date('2025-01-02'); 

      const transactionId = new mongoose.Types.ObjectId();

      transactionBatch.push({
        _id: transactionId,
        user: customerId,
        event: event._id,
        amount: event.ticketPrice * quantity,
        quantity,
        transactionDate: purchaseDate,
        status: 'completed'
      });

      for (let k = 0; k < quantity; k++) {
        ticketBatch.push({
          event: event._id,
          user: customerId,
          transaction: transactionId,
          price: event.ticketPrice,
          status: 'active',
          purchaseDate
        });
      }

      currentSold += quantity;
    }
    
    eventUpdates[event._id] = currentSold;
  }

  // Bulk Insert Transactions and Tickets
  console.log(`Inserting ${transactionBatch.length} transactions and ${ticketBatch.length} tickets...`);
  
  // Split into chunks if necessary (MongoDB has a 16MB doc limit, but insertMany handles splitting usually)
  // For safety/memory with large datasets, chunking manually is good practice.
  const CHUNK_SIZE = 5000;
  for (let i = 0; i < transactionBatch.length; i += CHUNK_SIZE) {
    await Transaction.insertMany(transactionBatch.slice(i, i + CHUNK_SIZE));
  }
  for (let i = 0; i < ticketBatch.length; i += CHUNK_SIZE) {
    await Ticket.insertMany(ticketBatch.slice(i, i + CHUNK_SIZE));
  }

  // Bulk Update Event ticket counts
  console.log('Updating Event ticket counts...');
  const bulkOps = Object.keys(eventUpdates).map(eventId => ({
    updateOne: {
      filter: { _id: eventId },
      update: { ticketsSold: eventUpdates[eventId] }
    }
  }));
  
  if (bulkOps.length > 0) {
    await Event.bulkWrite(bulkOps);
  }

  const end = Date.now();
  console.log(`Database Seeded Successfully in ${(end - start) / 1000}s!`);
};

// Check if running directly via node
if (require.main === module) {
  const mongoURI = process.env.MONGO_URI || 'mongodb://mongo:27017/etds?replicaSet=rs0';
  mongoose.connect(mongoURI)
    .then(() => seedDatabase())
    .then(() => {
      console.log('Seeding complete. Exiting...');
      process.exit(0);
    })
    .catch(err => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = { seedDatabase, clearDatabase };