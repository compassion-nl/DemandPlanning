/*
    Most of the code here is to generate placeholder values.
*/
var data = {
    'GlobalPartnerWeeklyDemandRequest' :
        {
            'GlobalPartner_ID' : window.GlobalPartnerId,
            'GlobalPartnerWeeklyDemandRequestList' : []
        }
};

var table;

/* Format the date in yyyy-mm-dd format from a js date object */
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    /* Remove these if statements if the date format does not require a 0 infront of single digit months or days */
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

/* Sorting the array */
//weeks.sort(function(a,b) { return a.prop - b.prop })

function sortByYmd(a,b) {
    /* Sort a JS array by WeekStartDate property.
        Invoke in a sort on an array i.e. array.sort(sortByYmd);
    */
    var x = new Date(a.WeekStartDate);
    var y = new Date(b.WeekStartDate);
    
    /* Invert the x and y to make the sort go the other way */
    return x-y;
}

//var last = array.slice(-1)[0];

function removeTheOldBuildTheNew(data) {
    var demands = data.GlobalPartnerWeeklyDemandRequest.GlobalPartnerWeeklyDemandRequestList;
    
    demands = demands.sort(sortByYmd);
    //console.log(demands.length);
    // remove past weeks
    
    var demandsLength = demands.length;

    
    var today = new Date(formatDate(new Date()));
    
    var weekStart = today.getDate() - (today.getDay()); 
    var thisWeekStartDate = new Date(today.setDate(weekStart));
    
    var endDate = new Date(demands[0].WeekEndDate);
    var startDate = new Date(demands[0].WeekStartDate);
    
    //console.log('This - ' + thisWeekStartDate);
    //console.log('B end - ' + endDate);
    
    while (thisWeekStartDate > endDate) {
        
        // Delete most recent date.
        demands.shift();
        
        // Reset the End date on the new date.
        if (demands.length == 0) {
            //console.log('IT IS ZERO!');
            break;
        }
        endDate = new Date(demands[0].WeekEndDate);
        
        //console.log('SHIFT');
    }
    
    // add new weeks to top back up to 78 weeks.
    var requiredNumber = 78 - demands.length;
    //console.log('required = ' + requiredNumber);
    
    if(requiredNumber !== 0) {
        if(requiredNumber == 78) {
            var newStartDate = formatDate(new Date());
            
        } else {
            // Set new start date for items to be added to array.
            var last = new Date(demands.slice(-1)[0].WeekEndDate);
            last.setDate(last.getDate() +1);
            newStartDate = formatDate(last);
        }
            //formatDate(new Date(last.getDate() + 1)); 
        
        //console.log('last - ' + last);
        console.log('newStartDate - ' + newStartDate);
        
        var topUp = generateTopUpDateJSON(requiredNumber, newStartDate);
        
        demands = demands.concat(topUp);
        
        console.log('post concat');
        console.log(demands);
        
        demands = demands.sort(sortByYmd);
        data.GlobalPartnerWeeklyDemandRequest.GlobalPartnerWeeklyDemandRequestList = demands;
        
        generateMessage('info', 'Data Updated.', ' Your most recent file was at least '+requiredNumber+' weeks out of date.');
        return data;    
        
    } else {
        
        return data;
    }
}

/* 
    Build out a json object that can be used as a template. 
    Plan on modifiying in the future to be used to automatically add future dates to table.  
*/
function generateDateJSON(numWeeks) {
    
    var GlobalPartnerWeeklyDemandsTemplate = []
    
    for (var i = 0; i < numWeeks; i++ ) {
        var d = new Date;
        d = new Date(d.setDate(d.getDate() + 7*i));
        
        var first = d.getDate() - d.getDay(); 
        
        var firstday = new Date(d.setDate(first));
        var lastday = new Date(d.setDate(firstday.getDate()+6));
        
        var obj = {};
        obj.WeekStartDate = formatDate(firstday);
        obj.WeekEndDate = formatDate(lastday);
        obj.TotalDemand = 0; //'<input type="text" id="row-' + i + '-demand" name="row-' + i + '-demand" value="0">';
        obj.ResupplyQuantity = 0; //'<input type="text" id="row-' + i + '-resupply" name="row-' + i + '-resupply" value="0">';;
        
        GlobalPartnerWeeklyDemandsTemplate.push(obj);
        
    }
    
    return GlobalPartnerWeeklyDemandsTemplate;
}

function generateTopUpDateJSON(numWeeks, startDate) {
    
    var GlobalPartnerWeeklyDemandsTemplate = []
    
    for (var i = 0; i < numWeeks; i++ ) {
        var d = new Date(startDate);
        d = new Date(d.setDate(d.getDate() + 7*i));
        
        var first = d.getDate() - d.getDay(); 
        
        var firstday = new Date(d.setDate(first));
        var lastday = new Date(d.setDate(firstday.getDate()+6));
        
        var obj = {};
        obj.WeekStartDate = formatDate(firstday);
        obj.WeekEndDate = formatDate(lastday);
        obj.TotalDemand = 0; 
        obj.ResupplyQuantity = 0;
        
        GlobalPartnerWeeklyDemandsTemplate.push(obj);
    }
    
    return GlobalPartnerWeeklyDemandsTemplate;
}

/*
    Helper function to add the temp data to the temp JSON. 
    Easier than navigating the object every time.
*/
function buildData(shell) {
    shell.GlobalPartnerWeeklyDemandRequest.GlobalPartnerWeeklyDemandRequestList = generateDateJSON(78);
    
    return shell;
}

/*
    DataTables likes an array of arrays. The JSON from GME is an array of objects with properties. 
    Need to transform this data into an easily tabular format which is what this does.
*/
function parseJSONforDataTables(json) {
    //console.log(json);
    var data = json.GlobalPartnerWeeklyDemandRequest.GlobalPartnerWeeklyDemandRequestList;
    // arr format = week number, start, end, demand, resupply
    var arrs = [];
    
    for(i = 0; i < data.length; i++) {
        var weekNum = i+1;
        var obj = data[i];
        
        //console.log(obj);
        
        var arr = [weekNum, obj.WeekStartDate, obj.WeekEndDate, obj.TotalDemand, obj.ResupplyQuantity];
        arrs.push(arr);
    }
    //console.log(arrs);
    return arrs; 
}

function parseDataTablesforJSON(dataTables) {
    var data = {
        'GlobalPartnerWeeklyDemandRequest' :
            {
                'GlobalPartner_ID' : window.GlobalPartnerId,
                'GlobalPartnerWeeklyDemandRequestList' : []
            }
    };
    
    var weeklyDemands = [];
    
    for(i = 0; i < dataTables.length; i++) {
        var obj = {};
        var row = dataTables[i];
        
        obj.WeekStartDate = row[1];
        obj.WeekEndDate = row[2];
        obj.TotalDemand = row[3];
        obj.ResupplyQuantity = row[4];
        
        weeklyDemands.push(obj);
    }
    
    data.GlobalPartnerWeeklyDemandRequest.GlobalPartnerWeeklyDemandRequestList = weeklyDemands;
    
    return data;    
}

/* Add Jquery listeners for changes on cells */ 
function tableRowUpdateListener(table) {
    $('tr').on('blur', 'input, [contenteditable]', function (e) {
        var closestTd = $(this).closest('td');
        if (closestTd.length > 0) {
            var aPos = table.fnGetPosition(closestTd[0]);
            table.fnUpdate(closestTd.html(), aPos[0], aPos[2], false);
        }
    });
    
    return;
}

/* Do everything on INIT 
    Ideally most of this will be handled in an AJAX request.
    Will build that out in future.
*/

function makeAjaxCall(thing, data) {
    var data = { [thing] : data }
    
    // Do the Ajax
    $.ajax({
        type: "POST",
        url: "",
        data: data,
        success: function(resp) {
            //console.log(resp);
            var current = $('#ajaxResponse').html()
            $('#ajaxResponse').html(resp + current);
        },
        error: function(resp) {
            console.log('Error');
            console.log(resp);
            var current = $('#ajaxResponse').html()
            $('#ajaxResponse').html(resp + current);
        }
    }); // Ajax Call  
}

function loadJSONdata() {
    var data = { 'load' : 'data' }
    
    // Do the Ajax
    $.ajax({
        type: "POST",
        url: "",
        data: data,
        success: function(resp) {
            var respJson = JSON.parse(resp);
            data = JSON.parse(respJson.data);
            generateMessage('','',respJson.msg);
            var updatedData = removeTheOldBuildTheNew(data);
            //var updatedData = data;
            /*console.log("-------------------------------------------------------");
            console.log(data);
            console.log(updatedData);
            console.log("-------------------------------------------------------");*/
            
            table.fnAddData(parseJSONforDataTables(updatedData));
            //var current = $('#ajaxResponse').html();
            //$('#ajaxResponse').html(respJson.msg + current);
            
        },
        error: function(resp) {
            console.log('Error');
            console.log(resp);
            $('#ajaxResponse').html(resp);
        }
    }); // Ajax Call  
}

/*
function generateMessage(type, bold, msg) {
     var alert = '<div class="alert alert-'+type+' alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button><strong>'+bold+'</strong> '+msg+'</div>';

    var current = $('#ajaxResponse').html();
    
    $('#ajaxResponse').html(current + alert);
    return true;
}*/


function generateMessage(type, bold, msg) {
    var thing = bold + " " + msg;
    var notification = document.querySelector('.mdl-js-snackbar');
        
    notification.MaterialSnackbar.showSnackbar(
      {
        message: thing
      }
    );
    /*
    showSnackbar(thing);
    return true;
    */
}


function showSnackbar(msg) {
    var notification = document.querySelector('.mdl-js-snackbar');
        
    notification.MaterialSnackbar.showSnackbar(
      {
        message: msg
      }
    );
}

$(function() {
    //data = JSON.parse(loadJSONdata());
    
    table = $('#demandTable').dataTable( {
        //"paging":       true,
        "ordering":     true,
        "searching":    true,
        "info":         true,
        "pagingType" :  "numbers",
        "columnDefs" : [
            {
                targets: [ 0, 1, 2 ],
                className: 'mdl-data-table__cell--non-numeric'
            }
        ]
    });
    /*
    data = buildData(data);
    
    var tableData = parseJSONforDataTables(data);
    //console.log(tableData);

    table.fnAddData(tableData);
    */
    
    loadJSONdata();
    
    table.on( 'draw.dt', function () {
        $('tr td:nth-child(4), tr td:nth-child(5)').attr('contenteditable','true');
        tableRowUpdateListener(table);

    });
    
    tableRowUpdateListener(table);
    $('tr td:nth-child(4), tr td:nth-child(5)').attr('contenteditable','true');
    
    $('#export-btn').click(function(e) {
        $('#export-text').text(JSON.stringify(parseDataTablesforJSON(table.fnGetData())));
        
        // Starting to setup the REST service call
        $.ajax({
            url: 'https://api2.compassion.com/test/ci/v2/globalpartners/demandplanning',
            type: 'POST',
            header: 'Content-Type: application/json',
            data: JSON.stringify(parseDataTablesforJSON(table.fnGetData())),
            success: function() { showSnackbar('The message has been sent successfully.'); },
            error: function() { showSnackbar('The message was unsuccessful.'); }
        });
    });
    
    $('#save-btn').click(function(e) {
        var data = JSON.stringify(parseDataTablesforJSON(table.fnGetData()));
        makeAjaxCall('save', data);
        showSnackbar('Data has been saved.')
    });
    
});