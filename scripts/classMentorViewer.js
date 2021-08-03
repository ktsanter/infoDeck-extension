//-------------------------------------------------------------------
// MentorViewer
//-------------------------------------------------------------------
// TODO:
//-------------------------------------------------------------------
class MentorViewer {
  constructor(config) {
    this.config = config;
    this.settings = {
      welcomeCheckedClasses: ['fas', 'fa-check-square', 'checked'],
      welcomeUncheckedClasses: ['far', 'fa-square']
    };
    this.data = null;
  }
  
  //--------------------------------------------------------------
  // public methods
  //--------------------------------------------------------------
  render() {}
  
  update(mentorData) {
    this.data = mentorData;
    
    UtilityKTS.removeChildren(this.config.container);
    this.config.container.appendChild(this._renderByTermAndSection());
  }

  //--------------------------------------------------------------
  // private methods
  //--------------------------------------------------------------   
  _renderByTermAndSection() {
    var container = CreateElement.createDiv(null, null, 'no available mentor information');
    
    if (!this.data || !this.data.hasOwnProperty('mentorsByTermAndSection')) return container;
    
    var mentorsTS = this.data.mentorsByTermAndSection;
    var termList = [];
    for (var term in mentorsTS) {
      termList.push(term);
    }
    termList = termList.sort();
    
    container.innerHTML = '';
    var firstTerm = true;
    for (var i = 0; i < termList.length; i++) {
      var term = termList[i];
      this._renderTerm(term, mentorsTS[term], container, firstTerm);
      firstTerm = false;
    }
    
    return container;
  }
  
  _renderTerm(term, termItem, container, firstTerm) {
    var sectionList = [];
    for (var section in termItem) {
      sectionList.push(section);
    }
    sectionList = sectionList.sort();
    
    var termClasses = 'term-label';
    if (!firstTerm) termClasses += ' not-first';
    container.appendChild(CreateElement.createDiv(null, termClasses, term));
    
    var firstSection = true;
    for (var i = 0; i < sectionList.length; i++) {
      var section = sectionList[i];
      this._renderSection(term, section, termItem[section], container, firstSection);
      firstSection = false;
    }
  }
  
  _renderSection(term, section, sectionItem, container, firstSection) {
    var sectionClasses = 'section-label';
    if (!firstSection) sectionClasses += ' not-first';
    var sectionLabel = CreateElement.createDiv(null, sectionClasses, section);
    container.appendChild(sectionLabel);
    
    var handler = (e) => { this._handleFilterControl(e); };
    var filterControlSpan = CreateElement.createSpan(null, null);
    container.appendChild(filterControlSpan);
    var filterControl = CreateElement.createIcon(null, 'welcomefilter fas fa-filter filter-off', 'filter checked', handler);
    filterControlSpan.appendChild(filterControl);

    var headerFields = ['name', 'email', 'phone', 'welcomelettersent'];
    var headerNames = ['name', 'email', 'phone', 'welcome'];

    var sortedMentors = this._sortMentorsForSection(sectionItem);
      var emailsForSection = '';
    for (var m = 0; m < sortedMentors.length; m++) {
      var mentor = sortedMentors[m];
      var row = CreateElement.createDiv(null, 'mentor-row');
      container.appendChild(row);
      
      for (var i = 0; i < headerFields.length; i++) {
        var name = headerNames[i];
        var value = mentor[headerFields[i]];
        var classes = 'cell-label cell-' + name;
        var elem = CreateElement.createDiv(null, classes, value);
        
        if (name == 'email') {
          elem.title = 'copy email';
          elem.addEventListener('click', (e) => { this._handleEmailClick(e); })
          emailsForSection += value + ';';
          
        } else if (name == 'welcome') {
          elem.innerHTML = '';
          
          var checkVal = JSON.stringify({"term": term, "section": section, "name": mentor.name});
          var checked = (value == 1);
          var handler = (e) => { this._handleMentorWelcomeClick(e); };
          var iconClasses = checked ? this.settings.welcomeCheckedClasses : this.settings.welcomeUncheckedClasses;
          var check = CreateElement.createIcon(null, 'mentor-welcomecontrol', '', handler);
          check.classList.add(...iconClasses);
          check.setAttribute('mentor-info', checkVal);
          elem.appendChild(check);
        }
        
        row.appendChild(elem);
      }
    }

    sectionLabel.title = 'copy all emails for section';
    sectionLabel.setAttribute("section-emails", emailsForSection);
    sectionLabel.addEventListener('click', (e) => { this._handleSectionClick(e); });
  }
  
  _sortMentorsForSection(sectionItem) {
    var mentorList = [];
    for (var mentor in sectionItem) {
      mentorList.push(sectionItem[mentor]);
    }
    
    mentorList = mentorList.sort(function(a,b) {
      return a.name.localeCompare(b.name);
    });
    
    return mentorList;
  }
  
  _toggleWelcomeFilter(target) {
    var filterOn = !target.classList.contains('filter-off');
    var turnFilterOn = !filterOn;
    
    var sib = target.parentNode;
    var done = false;
    while (!done) {
      sib = sib.nextElementSibling;
      if (sib.classList.contains('section-label')) {
        done = true;
        
      } else if (sib.classList.contains('mentor-row')) {
        var welcomeControl = sib.getElementsByClassName('mentor-welcomecontrol')[0];
        
        var hideRow = turnFilterOn && welcomeControl.classList.contains('checked');
        UtilityKTS.setClass(sib, 'hide-me', hideRow);
      }
    }
    
    UtilityKTS.setClass(target, 'filter-off', !turnFilterOn);
  }
    
  async _saveMentorWelcomeSettings(target) {
    var settings = JSON.parse(target.getAttribute('mentor-info'));
    var checked = !target.classList.contains('checked');
    
    var classRemove = this.settings.welcomeCheckedClasses;
    var classAdd = this.settings.welcomeUncheckedClasses;
    if (checked) {
      classRemove = this.settings.welcomeUncheckedClasses;
      classAdd = this.settings.welcomeCheckedClasses;
    }
    target.classList.remove(...classRemove);
    target.classList.add(...classAdd);
    
    var params = {
      ...{"property": 'welcomelettersent'},
      ...settings,
      ...{"welcomelettersent": checked}
    };
    
    var result = await this.config.callbackPropertyChange(params);
    if (result.success) {
      this.data.mentorsByTermAndSection[settings.term][settings.section][settings.name].welcomelettersent = checked;
      
      if (checked && this._welcomeFilterIsOn(target)) {
        var row = target.parentNode.parentNode;
        UtilityKTS.setClass(row, 'hide-me', true);
      }
    }
  }
  
  _welcomeFilterIsOn(target) {
    var mentorRow = target.parentNode.parentNode;
    var filterControl = this._upsearchForFilterControl(mentorRow);

    return !filterControl.classList.contains('filter-off');
  }

  //--------------------------------------------------------------
  // handlers
  //--------------------------------------------------------------   
  _handleEmailClick(e) {
    this._copyToClipboard(e.target.innerHTML);
    this.config.message('email copied');
  }
  
  _handleSectionClick(e) {
    var sectionEmails = e.target.getAttribute('section-emails');
    this._copyToClipboard(sectionEmails);
    this.config.message('section emails copied');
  }
  
  async _handleMentorWelcomeClick(e) {
    await this._saveMentorWelcomeSettings(e.target);
  }
  
  _handleFilterControl(e) {
    this._toggleWelcomeFilter(e.target);
  }
  
  //---------------------------------------
  // clipboard functions
  //----------------------------------------
  _copyToClipboard(txt) {
    if (!this.settings.clipboard) this.settings.clipboard = new ClipboardCopy(this.config.container, 'plain');

    this.settings.clipboard.copyToClipboard(txt);
	}

  _upsearchForFilterControl(target) {
    var sib = target;
    var done = false;
    while (!done) {
      sib = sib.previousElementSibling;
      if (sib.classList.contains('section-label')) done = true;
    }
    var filterControl = sib.nextElementSibling.getElementsByClassName('welcomefilter')[0]; 
    
    return filterControl;
  }    
  
  //--------------------------------------------------------------
  // utility
  //--------------------------------------------------------------

}
