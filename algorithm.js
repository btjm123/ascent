var lodash = require('lodash');

var adjlist = []; 
var leftMentors = [];
var match = [];
var pairings = 0;
var visited = [];
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

// recursion
function getPath(x) {
    if (visited[x]) return 0;
    visited[x] = 1;
    for (var i=0;i<adjlist[x].length;i++) {
        var rightMentee = adjlist[x][i];
        if (match[rightMentee] == -1) {
            match[rightMentee] = x;
            return 1;
        } else if (getPath(match[rightMentee])) {
            match[rightMentee] = x;
            return 1;
        } 
    }
    return 0;
}

async function getPairings(db) {
    try {
        var mentors = await db.collection("pairingMentors").find().toArray()
        var mentees = await db.collection("pairingMentees").find().toArray();

        db.collection("pairingMentors").drop();
        db.collection("pairingMentees").drop();
        // console.log("Mentors 😍: " + mentors);
        // console.log("Mentees 😎: " + mentees);
        while(adjlist.push([]) <= mentors.length);
        for (var i=0;i<mentors.length;i++) {
            leftMentors.push(mentors[i].id);
            for (var j=0;j<mentees.length;j++) {
                var level = mentors[i].level.split('/');
                var passedFirstRound = false;
                for (var k=0;k<level.length;k++) {
                    if (mentees[j].level == level[k]) {
                        passedFirstRound = true;
                        break;
                    }
                }
                if (!passedFirstRound) continue;
                // console.log(mentees[j]);
                var subjectsMentees = mentees[j].subject_needed.split('/');
                
                var subjectsMentors = mentors[i].subject.split('/');
                var tutoredSubject = "";
                var passedFinal = false;
                for (var k=0;k<subjectsMentors.length;k++) {
                    for (var t=0;t<subjectsMentees.length;t++) {
                        if (subjectsMentees[t] == subjectsMentors[k]) {
                            passedFinal = true;
                            tutoredSubject = subjectsMentees[t];
                            break;
                        }
                    } 
                    if (passedFinal) break;
                }
                if (passedFinal) adjlist[mentors[i].id].push(mentees[j].id);
            }
        }
    
        for (var i=0;i<(mentors.length+mentees.length+1);i++) match.push(-1);
        
        for (var i=0;i<leftMentors.length;i++) {
            visited = [];
            pairings += getPath(leftMentors[i]);
        }
        console.log(`${pairings} matchings found!`);
        console.log(match);
    
        let pairingsMap = [[]];
        pairingsMap.shift();
        let pairingCount = 0;
        for (var i = mentors.length;i<(mentees.length+mentors.length);i++) {
            var currentMentee = lodash.filter(mentees, { 'id': i } );
            var currentMentor = lodash.filter(mentors, { 'id': match[i] } );
            if (isEmpty(currentMentor)) {
                console.log(`${currentMentee[0].name} is currently not paired and will have to be manually assigned`);
                continue;
            }   
            // match[i] mentors i
            pairingsMap.push([currentMentor[0], currentMentee[0]]);
            pairingCount++;
    
            console.log(`${currentMentor[0].name} is paired to and will be mentoring ${currentMentee[0].name}`);
            
        }
    
        return pairingsMap

    } catch (err) {
        console.log(err)
    }
    
}
module.exports = getPairings;