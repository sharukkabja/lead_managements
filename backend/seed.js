const bcrypt = require('bcrypt');
require('dotenv').config();

const { sequelize, User, Lead, LeadActivity } = require('./api/models');

(async () => {
  try {
    await sequelize.sync({ force: true }); // change to true only in local dev

    /**
     * Seed Users
     */
    const usersData = [
      { name: 'Sales Admin', email: 'admin@sales.com' },
      { name: 'John Doe', email: 'john@sales.com' },
      { name: 'Jane Smith', email: 'jane@sales.com' },
    ];

    const users = [];
    for (const user of usersData) {
      const [createdUser] = await User.findOrCreate({
        where: { email: user.email },
        defaults: user,
      });
      users.push(createdUser);
    }

    /**
     * Seed Leads
     */
    const leadsData = [
      {
        name: 'Rahul Sharma',
        email: 'rahul@gmail.com',
        phone: '9876543210',
        source: 'website',
        status: 'new',
        assigned_to: users[0].id,
      },
      {
        name: 'Anita Verma',
        email: 'anita@gmail.com',
        phone: '9123456789',
        source: 'referral',
        status: 'contacted',
        assigned_to: users[1].id,
      },
    ];

    const leads = [];
    for (const lead of leadsData) {
      const [createdLead] = await Lead.findOrCreate({
        where: { email: lead.email },
        defaults: lead,
      });
      leads.push(createdLead);
    }

    /**
     * Seed Lead Activities
     */
    const activitiesData = [
      {
        lead_id: leads[0].id,
        activity_type: 'note',
        description: 'Lead created from website',
        created_by: users[0].id,
      },
      {
        lead_id: leads[1].id,
        activity_type: 'status_change',
        description: 'Status changed from new to contacted',
        created_by: users[1].id,
      },
    ];

    for (const activity of activitiesData) {
      await LeadActivity.findOrCreate({
        where: {
          lead_id: activity.lead_id,
          description: activity.description,
        },
        defaults: activity,
      });
    }

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
})();
