const { Task , Attachment,Sequelize,Sequelize:{ Op }, sequelize } = require('../../models')
const path = require('path')

index = async (req,res) => {
  
}
totalTasks = async (req,res) => {

    // Total tasks
    let allTasks = await Task.count({
        where: {
            userId: req.user.id,
        }
    }).catch(e => console.log(e))


    // Completed tasks
    let tasksCompleted = await Task.count({
        where: {
            userId: req.user.id,
            status: true
        }
    }).catch(e => console.log(e))
    
    
    
    // Incompleted tasks
    let tasksNotCompleted = await Task.count({
        where: {
            userId: req.user.id,
            status: false
        }
    }).catch(e => console.log(e))


    return res.send({ data: {
        allTasks,
        tasksCompleted,
        tasksNotCompleted,
    }, status: 'success'})
}
averageCompletedTasksPerDay = async (req,res) => {

    // Total tasks
    let dailyTaskCounts = await Task.findAll({
        attributes: [[sequelize.fn('count','id'),'dailytasks']],
        where: {
            userId: req.user.id,
        },
        group: [['completedAt']]
    }).catch(e => console.log(e))

    let total = 0

    for(val of dailyTaskCounts){
        total = Number(val.dataValues.dailytasks) + Number(total)
    }

    return res.send({ data: {
        averageDailyTaskCompleted:  (total/dailyTaskCounts.length).toFixed(2),
    }, status: 'success'})
}
overDueTasks = async (req,res) => {

    // Total tasks
    let overDue = await Task.count({
        where: {
            userId: req.user.id,
            status: true,
            completedAt: {
                [Op.gt]: sequelize.col('dueDate')
            }
        }
    }).catch(e => console.log(e))




    return res.send({ data: {
        overDueTasks: overDue,
    }, status: 'success'})
}
maxTasksCompletionDay = async (req,res) => {

    let dailyTaskCounts = await Task.findAll({
        attributes: [[sequelize.fn('count','id'),'taskCompleted'], 'completedAt'],
        where: {
            userId: req.user.id,
        },
        group: [['completedAt']]
    }).catch(e => console.log(e))

    let maximumTasks = {taskCompleted:0,completedAt:null}
    for(task of dailyTaskCounts) {
        if(task.dataValues.taskCompleted > maximumTasks.taskCompleted){
            maximumTasks = { 
                taskCompleted: task.dataValues.taskCompleted,
                completedAt: task.completedAt,
            }
        }
    }

    return res.send({ 
        data: {
            ...maximumTasks,
        }, 
        status: 'success'
    })
}
tasksOpenInDayOfWeek = async (req,res) => {

    // Total tasks
    // let allTasks = await Task.count({
    //     attributes: [],
    //     where: {
    //         userId: req.user.id,
    //     },
    //     group: [sequelize.fn(`DAYNAME`,`startDate`)]
    // }).catch(e => console.log(e))


    let sql = "SELECT DAYNAME(`startDate`) as `day`, count(*) AS `tasksopened` FROM `Tasks` AS `Task` WHERE `Task`.`userId` = 1 GROUP BY DAYNAME(`startDate`)"

    let allTasks = await sequelize.query(sql, null, {raw: true})
    
    return res.send({ data: {
        ...allTasks[0],
    }, status: 'success'})
}


module.exports = {
    totalTasks,
    averageCompletedTasksPerDay,
    overDueTasks,
    maxTasksCompletionDay,
    tasksOpenInDayOfWeek,
}