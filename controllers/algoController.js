const algo = require('../algorithm.js');
const fs = require('fs');
const { promisify } = require('util');
 const writeFileAsync = promisify(fs.writeFile)
module.exports = async (db, mentorsData, menteesData, callback) => {
    let mentorsArray = [];
    let menteesArray = [];
    // console.log('asdsad');
    for (var i=0;i<mentorsData.length;i++) {
        let mentor = {};
        mentor['id'] = i;
        mentor['name'] = mentorsData[i].name;
        mentor['subject'] = mentorsData[i].primary_subject;
        mentor['subject1grades'] = mentorsData[i].subject1grades;
        mentor['level'] = mentorsData[i].preferredlevel;
        mentor['contact'] = mentorsData[i].contact;
        mentor['email'] = mentorsData[i].email;
        mentor['teachingstyle'] = mentorsData[i].teachingstyle;
        mentorsArray.push(mentor);
    }
    for (var i=0;i<menteesData.length;i++) {
        let mentee = {};
        mentee['id'] = i+mentorsData.length;
        mentee['name'] = menteesData[i].name;
        mentee['subject_needed'] = menteesData[i].primary_subject;
        mentee['subject1grades'] = mentorsData[i].subject1grades;
        mentee['grades'] = menteesData[i].subject1grades;
        mentee['level']  = menteesData[i].level;
        mentee['contact'] = menteesData[i].contact;
        mentee['email'] = menteesData[i].email;
        mentee['learningstyle'] = menteesData[i].learningstyle;
        menteesArray.push(mentee);
    }
    try {
        const pairingMentors = db.collection("pairingMentors");
        await pairingMentors.insertMany(mentorsArray);

        const pairingMentees = db.collection("pairingMentees");
        await pairingMentees.insertMany(menteesArray);

        // await writeFileAsync('./data/mentees.json', JSON.stringify(menteesArray));
        // await writeFileAsync('./data/mentors.json', JSON.stringify(mentorsArray));
        const pairingsMap = algo(db);
        callback(null, pairingsMap);
        
    } catch(err) {
        callback(err, null);
    }
}