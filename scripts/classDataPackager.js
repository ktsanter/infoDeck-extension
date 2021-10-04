//-------------------------------------------------------------------
// DataPackager
//-------------------------------------------------------------------
// TODO:
//-------------------------------------------------------------------
class DataPackager {
  constructor(config) {
    this.config = config;
  }
  
  //--------------------------------------------------------------
  // public methods
  //--------------------------------------------------------------   
  static packageStudentInfo(rosterData, studentProperties) {
    var students = {};
    
    for (var i = 0; i < rosterData.raw_enrollment_data.length; i++) {
      var item = rosterData.raw_enrollment_data[i];
      var student = item.student;
      if (!students.hasOwnProperty(student)) {
        students[student] = {
        "enrollments": [], 
        "mentors": [], 
        "guardians": [],
        "iep": false,
        "504": false,
        "homeschooled": false,
        "preferredname": '',
        "pronouns": '',
        "notes": [],
        "enddateoverride": []
      }}
      students[student].enrollments.push(item);
    }
    
    for (var i = 0; i < rosterData.raw_mentor_data.length; i++) {
      var item = rosterData.raw_mentor_data[i];
      var student = item.student;
      student = student.replace(/&#39;/g, "'");      
      if (students.hasOwnProperty(student)) {
        students[student].mentors.push(item);
      } else {
        console.log('mentor for unknown student', item);
      }
    }

    for (var i = 0; i < rosterData.raw_guardian_data.length; i++) {
      var item = rosterData.raw_guardian_data[i];
      var student = item.student;
      student = student.replace(/&#39;/g, "'");
      if (students.hasOwnProperty(student)) {
        students[student].guardians.push(item);
      } else {
        console.log('guardian for unknown student', item);
      }
    }

    for (var i = 0; i < rosterData.raw_iep_data.length; i++) {
      var item = rosterData.raw_iep_data[i];
      var student = item.student;
      student = student.replace(/&#39;/g, "'");
      if (students.hasOwnProperty(student)) {
        students[student].iep = true;
      } else {
        console.log('IEP for unknown student', item);
      }
    }

    for (var i = 0; i < rosterData.raw_504_data.length; i++) {
      var item = rosterData.raw_504_data[i];
      var student = item.student;
      student = student.replace(/&#39;/g, "'");
      if (students.hasOwnProperty(student)) {
        students[student]["504"] = true;
      } else {
        console.log('504 for unknown student', item);
      }
    }

    for (var i = 0; i < rosterData.raw_homeschooled_data.length; i++) {
      var item = rosterData.raw_homeschooled_data[i];
      var student = item.student;
      student = student.replace(/&#39;/g, "'");
      if (students.hasOwnProperty(student)) {
        students[student].homeschooled = true;
      } else {
        console.log('homeschooled for unknown student', item);
      }
    }

    for (var i = 0; i < studentProperties.preferredname.length; i++) {
      var item = studentProperties.preferredname[i];
      var student = item.studentname;
      student = student.replace(/&#39;/g, "'");
      if (students.hasOwnProperty(student)) {
        students[student].preferredname = item.preferredname;
      }
    }
      
    for (var i = 0; i < studentProperties.pronouns.length; i++) {
      var item = studentProperties.pronouns[i];
      var student = item.studentname;
      student = student.replace(/&#39;/g, "'");
      if (students.hasOwnProperty(student)) {
        students[student].pronouns = item.pronouns;
      }
    }
      
    for (var i = 0; i < studentProperties.notes.length; i++) {
      var item = studentProperties.notes[i];
      var student = item.studentname;
      student = student.replace(/&#39;/g, "'");
      if (students.hasOwnProperty(student)) students[student].notes.push({
        "datestamp": item.datestamp, 
        "notetext": item.notetext,
        "noteid": item.noteid
      });
    }
    
    for (var i = 0; i < studentProperties.eventoverride.length; i++) {
      var item = studentProperties.eventoverride[i];
      var student = item.student;
      student = student.replace(/&#39;/g, "'");
      if (students.hasOwnProperty(student)) {
        students[student].enddateoverride.push(item);
      } else {
        console.log('end date override for unknown student', item);
      }
    }

    var studentList = [];
    for (var key in students) studentList.push(key);
    
    return {
      "students": students,
      "studentList": studentList.sort()
    };
  }
  
  static packageMentorInfo(rosterData, extraMentorInfo) {
    var mentors = {};
    var mentorsByTermAndSection = {};
    var mentorsBySection = {};

    for (var i = 0; i < rosterData.raw_mentor_data.length; i++) {
      var item = rosterData.raw_mentor_data[i];
      var name = item.name;
      var term = item.term;
      var section = item.section;
      
      if (!mentors.hasOwnProperty(name)) mentors[name] = {
        "name": name,
        "email": item.email,
        "phone": item.phone,
        "affiliation": item.affiliation,
        "affiliationphone": item.affiliationphone,
      }
      
      var welcomeLetterSent = this._wasWelcomeLetterSent(extraMentorInfo, term, section, name);
      
      if (!mentorsByTermAndSection.hasOwnProperty(term)) mentorsByTermAndSection[term] = {};
      if (!mentorsByTermAndSection[term].hasOwnProperty(section)) mentorsByTermAndSection[term][section] = {};
      if (!mentorsByTermAndSection[term][section].hasOwnProperty(name)) mentorsByTermAndSection[term][section][name] = {
        "name": name,
        "email": item.email,
        "phone": item.phone,
        "affiliation": item.affiliation,
        "affiliationphone": item.affiliationphone,
        "welcomelettersent": welcomeLetterSent
      };
      
      if (!mentorsBySection.hasOwnProperty(section)) mentorsBySection[section] = {};
      if (!mentorsBySection[section].hasOwnProperty(name)) mentorsBySection[section][name] = {
        "name": name,
        "email": item.email,
        "phone": item.phone,
        "affiliation": item.affiliation,
        "affiliationphone": item.affiliationphone,
        "welcomelettersent": welcomeLetterSent
      }
    }

    var mentorList = [];
    for (var key in mentors) mentorList.push(key);
    
    return {
      "mentors": mentors,
      "mentorsByTermAndSection": mentorsByTermAndSection,
      "mentorsBySection": mentorsBySection,
      "mentorList": mentorList.sort()
    };
  }
  
  static _wasWelcomeLetterSent(extraMentorInfo, term, section, name) {
    var letterSent = false;

    for (var i = 0; i < extraMentorInfo.length && !letterSent; i++) {
      var item = extraMentorInfo[i];
      if (/*item.term == term && */item.section == section && item.name == name) {
        letterSent = (item.welcomelettersent == 1);
      }
    }
    
    return letterSent;
  }  

  //--------------------------------------------------------------
  // private methods
  //--------------------------------------------------------------   

  //--------------------------------------------------------------
  // utility
  //--------------------------------------------------------------

}
