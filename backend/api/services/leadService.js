var appConstants = require('../common/appConstants');
const { Lead, User, LeadActivity } = require('../models');
const { Sequelize } = require('sequelize');
const {
  normalizeEmail,
  normalizePhone,
  normalizeName,
} = require('../common/leadDuplicateHelper');

var leadService = {
    Leads : function(req, res){
        return new Promise(async (resolve, reject) => {

              const { name, email, phone, source } = req.body;

              const users = await User.findAll({
                                    subQuery: false,
                                    attributes: [
                                        'id',
                                        [Sequelize.fn('COUNT', Sequelize.col('leads.id')), 'leadCount'],
                                    ],
                                    include: [{ model: Lead,  as: 'leads', attributes: [] }],
                                    group: ['User.id'],
                                    order: [[Sequelize.literal('leadCount'), 'ASC']],
                                    limit: 1,
                                });

                                const assignedUser = users[0];

                                const lead = await Lead.create({
                                                    name,
                                                    email,
                                                    phone,
                                                    source,
                                                    assigned_to: assignedUser.id,
                                                    });
                        let data = {
                            lead : lead,
                            assigned_to: assignedUser
                        }
                        resolve({executed : 1, data : data});
          
        });
    },
    GetLeads : function(req, res){
        return new Promise(async (resolve, reject) => {

                const {
                        page = 1,
                        status,
                        source,
                        assigned_to,
                        sort = 'created_at',
                        } = req.query;

                const where = {};
                    if (status) where.status = status;
                    if (source) where.source = source;
                    if (assigned_to) where.assigned_to = assigned_to;

                  const leads = await Lead.findAndCountAll({
                                subQuery: false, 
                                where,
                                include: [
                                    {
                                    model: User,
                                    as: 'assignedUser',
                                    attributes: ['id', 'name'],
                                    required: false,
                                    },
                                    {
                                    model: LeadActivity,
                                    as: 'activities',
                                    attributes: [],
                                    required: false,
                                    },
                                ],
                                attributes: {
                                    include: [
                                    [
                                        Sequelize.fn('COUNT', Sequelize.col('activities.id')),
                                        'activityCount',
                                    ],
                                    ],
                                },
                                group: ['Lead.id', 'assignedUser.id'], // ✅ alias, not User.id
                                order: [
                                    [
                                    sort === 'last_activity' ? 'updated_at' : 'created_at',
                                    'DESC',
                                    ],
                                ],
                                limit: 10,
                                offset: (page - 1) * 10,
                                });

                    
                    resolve({executed : 1, data : leads});
          
        });
    },
    UpdateLeadStatus : function(req, res){
        return new Promise(async (resolve, reject) => {
                
               const allowedTransitions = {
                        new: ['contacted', 'lost'],
                        contacted: ['qualified', 'lost'],
                        qualified: ['converted', 'lost'],
                        converted: [],
                        lost: [],
                        };

                const { status } = req.body;
                const lead = await Lead.findByPk(req.params.id);

                if (!lead) return res.status(404).json({ message: 'Lead not found' });

                if (
                !allowedTransitions[lead.status].includes(status)
                ) {
                return res.status(400).json({ message: 'Invalid status transition' });
                }

                const oldStatus = lead.status;
                lead.status = status;
                await lead.save();

                await LeadActivity.create({
                                        lead_id: lead.id,
                                        activity_type: 'status_change',
                                        description: `Status changed from ${oldStatus} to ${status}`,
                                        });
                   
                resolve({executed : 1, data : lead});
          
        });
    },
    ActivitiesForALead : function(req, res){
        return new Promise(async (resolve, reject) => {
                
                    const lead = await Lead.findOne({
                    where: { id: req.params.id },
                    include: [
                        { model: User, as: 'assignedUser', attributes: ['id', 'name'] }
                    ],
                    });

                    if (!lead) {
                    return res.status(404).json({ executed: 0, message: 'Lead not found' });
                    }

                    const activities = await LeadActivity.findAll({
                    where: { lead_id: req.params.id },
                    include: [
                        { model: User, as: 'createdBy', attributes: ['id', 'name'] }
                    ],
                    order: [['created_at', 'DESC']],
                    });
                  const groupedActivities = Object.values(
                                            activities.reduce((acc, act) => {
                                                const dateStr = act.createdAt.toISOString().split('T')[0];

                                                if (!acc[dateStr]) {
                                                acc[dateStr] = { date: dateStr, activities: [] };
                                                }

                                                acc[dateStr].activities.push({
                                                id: act.id,
                                                type: act.activity_type,   
                                                message: act.description,
                                                createdAt: act.createdAt,
                                                createdBy: act.createdBy ? { id: act.createdBy.id, name: act.createdBy.name } : null,
                                                });

                                                return acc;
                                            }, {})
                                            );



                   
                resolve({executed : 1, data : {
                                        lead: {
                                        id: lead.id,
                                        name: lead.name,
                                        email: lead.email,
                                        phone: lead.phone || null,
                                        source: lead.source || null,
                                        status: lead.status,
                                        assignedUser: lead.assignedUser
                                            ? { id: lead.assignedUser.id, name: lead.assignedUser.name }
                                            : null,
                                        updatedAt: lead.updatedAt,
                                        },
                                        activities: groupedActivities,
                                    },});
          
        });
    },
    CheckDuplicateLead : function(req, res){
        return new Promise(async (resolve, reject) => {
                
               const { name, email, phone } = req.body;

                const normalizedEmail = email ? normalizeEmail(email) : null;
                const normalizedPhone = phone ? normalizePhone(phone) : null;
                const normalizedName = name ? normalizeName(name) : null;

                const leads = await Lead.findAll({
                    attributes: ['id', 'name', 'email', 'phone'],
                    limit: 50,
                });

                const matches = [];

                for (const lead of leads) {
                    let confidence = 0;
                    const matchedOn = [];

                    // Email match
                    if (
                    normalizedEmail &&
                    normalizeEmail(lead.email) === normalizedEmail
                    ) {
                    confidence += 50;
                    matchedOn.push('email');
                    }

                    // Phone match
                    if (
                    normalizedPhone &&
                    normalizePhone(lead.phone) === normalizedPhone
                    ) {
                    confidence += 30;
                    matchedOn.push('phone');
                    }

                    // Name fuzzy match
                    if (
                    normalizedName &&
                    normalizeName(lead.name) === normalizedName
                    ) {
                    confidence += 20;
                    matchedOn.push('name');
                    }

                    if (confidence > 0) {
                    matches.push({
                        id: lead.id,
                        name: lead.name,
                        email: lead.email,
                        phone: lead.phone,
                        matchedOn,
                        confidence,
                    });
                    }
                }

                const highestConfidence = matches.length
                    ? Math.max(...matches.map((m) => m.confidence))
                    : 0;
                
                const data = {
                    isDuplicate: highestConfidence >= 50,
                    confidence: highestConfidence,
                    matches,
                }
                resolve({executed : 1, data : data});
          
        });
    },
};


module.exports = leadService;