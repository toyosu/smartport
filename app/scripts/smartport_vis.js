/********************************************************
 *														*
 * 	dj.js example using Smart Port Dataset			 	*
 * 														*
 *														*
 ********************************************************/
function print_filter(filter) {
    var f = eval(filter);
    if (typeof(f.length) != "undefined") {} else {}
    if (typeof(f.top) != "undefined") {
        f = f.top(Infinity);
    } else {}
    if (typeof(f.dimension) != "undefined") {
        f = f.dimension(function(d) {
            return "";
        }).top(Infinity);
    } else {}
    console.log(filter + "(" + f.length + ") = " + JSON.stringify(f).replace(
        "[", "[\n\t").replace(/}\,/g, "},\n\t").replace("]", "\n]"));
}

function RefreshTable(alldata) {
    datatable.fnClearTable();
    datatable.fnAddData(alldata);
    datatable.fnDraw();
}
/********************************************************
 *														*
 * 	Step0: Load data from json file						*
 *														*
 ********************************************************/
d3.json("data/convertcsvBerthVesselRecordWeatherreducted.json", function(data) {
	
/********************************************************
*														*
* 	Step1: Create the dc.js chart objects & ling to div	*
*														*
{
        "Vessel_ID": "40798",
        "Berth": "J24/25",
        "ETB": "2014-05-13 07:30:00",
        "ETU": "2014-05-15 03:00:00",
        "ATB": "2014-05-13 07:30:00",
        "ATU": "2014-05-15 03:15:00",
        "EstBerthDuration": 2610,
        "ActBerthDuration": 2625,
        "BerthTiming": 0,
        "UnberthTiming": 15,
        "BerthStatus": "On Time",
        "UnberthStatus": "Delayed",
        "TotalBerthTiming": 15,
        "BerthScheduleStatus": "Delayed",
        "ActualDate": "13",
        "ActualMonth": "5",
        "ActualYear": "2014",
        "BerthingDurationCategory": "Long Berthing",
        "DeltaDurationCategory": "Short Delta"
    },
	
    //var totalDim = ndx.dimension(function(d) { return d['TotalBerthTiming']; });
    //var total_90 = totalDim.filter(10); 
    //print_filter(total_90)
    //var typeDim  = ndx.dimension(function(d) {return d.BerthScheduleStatus;});
    //var delayed_filter = typeDim.filter("Delayed"); 
    //print_filter(delayed_filter); 
    //var total = typeDim.group().reduceSum(function(d) {return d.TotalBerthTiming;});
    //print_filter(total); 
    //var delayed_total = ndx.groupAll().reduceSum(function(d) {return d.TotalBerthTiming;}).value() 
    //print_filter(delayed_total); 
    //var cash_and_visa_filter = typeDim.filter(function(d) { if (d ==="Delayed" || d==="Faster") {return d;} });  
    //print_filter(cash_and_visa_filter);
    //typeDim.filterAll();	
********************************************************/
    var ndx = crossfilter(data);

    var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
    data.forEach(function(d) {
        var month = new Array();
        month[0] = "January";
        month[1] = "February";
        month[2] = "March";
        month[3] = "April";
        month[4] = "May";
        month[5] = "June";
        month[6] = "July";
        month[7] = "August";
        month[8] = "September";
        month[9] = "October";
        month[10] = "November";
        month[11] = "December";
        d.ETB = parseDate(d.ETB.substr(0, 19)); //"2014-05-13 07:30:00";
        d.ETU = parseDate(d.ETU.substr(0, 19));
        d.ATB = parseDate(d.ATB.substr(0, 19));
        d.ATU = parseDate(d.ATU.substr(0, 19));
        d.EstBerthDuration = +d.EstBerthDuration; // 2610;
        d.ActBerthDuration = +d.ActBerthDuration; // 2625;
        d.BerthTiming = +d.BerthTiming; // 0;
        d.UnberthTiming = +d.UnberthTiming; // 15;
        d.TotalBerthTiming = +d.TotalBerthTiming; // 15;
        d.UVesselType = d.VesselType ? d.VesselType : 'unknown';
        d.ComBerthStatus = d.BerthStatus + " " + d.BerthTiming +  "min";
        d.ComUnberthStatus = d.UnberthStatus + " " + d.UnberthTiming + "min";
        var r = d.RainfallCategory;
        if (r == "") d.RainfallCategory = "No Data";
        else d.RainfallCategory = r;
        var r = d.RainfallPeriodCategory;
        if (r == "") d.RainfallPeriodCategory = "No Data";
        else if (r == "Low Rain Period") d.RainfallPeriodCategory = "Short Rain Period";
        d.ATBMonth = month[d3.time.month(d.ATB).getMonth()]; // pre-calculate month for better performance
        d.total = d.TotalBerthTiming;
        d.Month = d.ATB.getMonth() + 1;
    });
   
    // set crossfilter
    /********************************************************
     *														*
     * 	Step3: 	Create Dimension that we'll need			*
     *														*
     ********************************************************/
	 
	//print_filter(data); 
    var all = ndx.groupAll();
   /* // dimension by month
    var monthDimension = ndx.dimension(function(d) {
        return d3.time.month(d.ATB).getMonth();
    });
    // maintain running tallies by year as filters are applied or removed
    var n = monthDimension.groupAll().reduceCount().value();
    var BerthTiming = monthDimension.groupAll().reduceSum(function(fact) {
        return fact.BerthTiming;
    }).value()
   // console.log("There are " + BerthTiming + "min BerthTiming in Month.") 
*/

   	/* DIMENSION 1 */ 
    var ATBMonthDimension = ndx.dimension(function(d) {
        return d['ATBMonth'];
    });
    var ATBMonthGroup = ATBMonthDimension.group().reduceCount();
   // var a = ATBMonthGroup.top(6);
	// console.log("ATBMonthGroup: There are " + ATBMonthGroup + " Count")
    //console.log("ATBMonthGroup " + a[0].value + ": " + a[0].key + ".");
	
	/* DIMENSION 2 */
    var BerthScheduleStatusDimension = ndx.dimension(function(d) {
        return d['BerthScheduleStatus'];
    });
    var BerthScheduleStatusGroup = BerthScheduleStatusDimension.group().reduceCount();
		
    /* DIMENSION 3 */
    var BerthingDurationCategoryDimension = ndx.dimension(function(d) {
        return d['BerthingDurationCategory'];
    });
    var BerthingDurationCategoryGroup = BerthingDurationCategoryDimension.group().reduceCount();

    /* DIMENSION 4 */
    var DeltaDurationCategoryDimension = ndx.dimension(function(d) {
        return d['DeltaDurationCategory'];
    });
    var DeltaDurationCategoryGroup = DeltaDurationCategoryDimension.group().reduceCount();

	/* DIMENSION 5 */
    var UnberthStatusDimension = ndx.dimension(function(d) {
        var ub = d.UnberthStatus;
        var b = d.BerthStatus;
        var ubon;
        var bon;
        if (ub == "On Time" && b == "On Time") return "No Gap";
        if (ub == "On Time") {
            return "Berthing"
        } else if (b == "On Time") {
            return "Unberthing"
        } else {
            return "Both Period ";
        }
    });
    var UnberthStatusGroup = UnberthStatusDimension.group().reduceCount();

    /* DIMENSION 6 */
    var RainDimension = ndx.dimension(function(d) {
        var r = d.RainfallCategory;
        if (r == "") return "No Data";
        else {
            return r;
        }
    });
    var RainGroup = RainDimension.group().reduceCount();

	/* DIMENSION 7 */
    var RainPeriodDimension = ndx.dimension(function(d) {
        var r = d.RainfallPeriodCategory;
        if (r == "") return "No Data";
        else {
            return r;
        }
    });
    var RainPeriodGroup = RainPeriodDimension.group().reduceCount();

	
	/* DIMENSION 8 */
    var actualBerthDim = ndx.dimension(function(d) {
        return d3.time.day(d.ATB);
    }); 
    var actualBerthGroup = actualBerthDim.group().reduceSum(function(d) {
        return d.TotalBerthTiming / 3600;
    });
    var timing_berth = actualBerthDim.group().reduceSum(function(d) {
        return d.BerthTiming / 3600;
    });
    var timing_unberth = actualBerthDim.group().reduceSum(function(d) {
        return d.UnberthTiming / 3600;
    });
    var timing_actual = actualBerthDim.group().reduceSum(function(d) {
        return d.ActBerthDuration / 3600;
    });
    var minDate = actualBerthDim.bottom(1)[0].ATB;
    var maxDate = actualBerthDim.top(1)[0].ATB;
    var pseudoDimension = {
        top: function(x) {
            return actualBerthGroup.top(x).map(function(grp) {
                return {
                    "Customer": grp.key,
                    "Sum": grp.value
                };
            });
        }
    };
    VesselTypeGroup = actualBerthDim.group().reduce(function(p, d) {
        if (d.Vessel_ID in p.VesselTypes) p.VesselTypes[d.Vessel_ID]++;
        else {
            p.VesselTypes[d.Vessel_ID] = 1;
            p.vesselCount++;
        }
        return p;
    }, function(p, d) {
        p.VesselTypes[d.Vessel_ID]--;
        if (p.VesselTypes[d.Vessel_ID] === 0) {
            delete p.VesselTypes[d.Vessel_ID];
            p.vesselCount--;
        }
        return p;
    }, function() {
        return {
            vesselCount: 0,
            VesselTypes: {}
        };
    });

	/* DIMENSION 9 - dimension by Berth*/	
    var berthDimension = ndx.dimension(function(d) {
        return d['Berth'];
    });
    var berthGroup = berthDimension.group();
    var berthDimensionGroup = berthDimension.group().reduceCount();
     var BerthScheduleStatus = berthDimension.group().reduce(function(p,
        v) {
        p.BerthScheduleStatus += v.BerthScheduleStatus;
        return p;
    }, function(p, v) {
        p.BerthScheduleStatus -= v.BerthScheduleStatus;
        return p;
    }, function() {
        return {
            BerthScheduleStatus: 0,
        };
    });
   //console.log(berthDimensionGroup.all())


	/* DIMENSION 10 - dimension by Vessel*/
    var vesselDimension = ndx.dimension(function(d) {
        return d.VesselType;
    });
    var vesselGroup = vesselDimension.group();
    var vesselDimensionGroup = vesselDimension.group().reduceCount();

	/* DIMENSION 11 - dimension by Vessel*/
    var vesselIDDimension = ndx.dimension(function(d) {
        return d.Vessel_ID;
    });
   // var vesselIDGroup = vesselIDDimension.group();
    var vesselIDDimensionGroup = vesselIDDimension.group().reduceCount();
	
    vesselIDDimension.filterAll();
/*  var topten = vesselIDDimensionGroup.top(10)
    print_filter(topten);
    var toptengroup = {
        all: function() {
            return vesselIDDimensionGroup.all().filter(function(
                d) {
                return d.value >= 200;
            })
        }
    };*/

	/* DIMENSION 12 - dimension by Vessel*/
    var rainDimension = ndx.dimension(function(d) {
        return d3.time.day(d.ATB);
    });
    var rainDimensionGroup = rainDimension.group().reduceCount();
    var rainPerformanceGroup = rainDimension.group().reduce(
        /* callback for when data is added to the current filter results */
        function(p, v) {
            ++p.count;
            p.sumIndex += v.TB1;
            p.avgIndex = p.sumIndex / p.count;
            return p;
        },
        /* callback for when data is removed from the current filter results */
        function(p, v) {
            --p.count;
            p.sumIndex -= v.TB1;
            p.avgIndex = p.sumIndex / p.count;
            return p;
        },
        /* initialize p */
        function() {
            return {
                count: 0,
                sumIndex: 0,
                avgIndex: 0
            };
        });
    var minRainDate = rainDimension.bottom(1)[0].ATB;
    var maxRainDate = rainDimension.top(1)[0].ATB;

 	 
    /********************************************************
     *														*
     * 	Step4: Create the Visualisations					*
     *														*
     ********************************************************/
   /* Create a pie chart and use the given css selector as anchor. You can also specify
     * an optional chart group for this chart to be scoped within. When a chart belongs
     * to a specific group then any interaction with such chart will only trigger redraw
     * on other charts within the same chart group. */
	 
	/* CHART 1 */
    dc.pieChart("#chart-ring-year").width(250) // (optional) define chart width, :default = 200
        .height(150) // (optional) define chart height, :default = 200
        .transitionDuration(500) // (optional) define chart transition duration, :default = 350
        .innerRadius(30).colors(d3.scale.category10()).dimension(ATBMonthDimension) // set dimension
        .group(ATBMonthGroup) // set group
        .label(function(d) {
            return d.data.key;
        }).renderLabel(true).title(function(d) {
            return d.data.value;
        }).renderTitle(true);

	/* CHART 2 */		
    dc.pieChart("#chart-ring-status").width(250) 
        .height(150) 
        .transitionDuration(500) 
        .colors(d3.scale.category10())
        .innerRadius(30).dimension(BerthScheduleStatusDimension) 
        .group(BerthScheduleStatusGroup)
        .label(function(d) {
            return d.data.key + "(" + Math.floor(d.data.value / all.value() * 100) + "%)";
        })
       .renderLabel(true)
       .title(function(d) {
            return d.data.key + "(" + d.data.value + ")";         // (optional) by default pie chart will use group.key and group.value as its title you can overwrite it with a closure
        }).legend(dc.legend().x(80).y(70).itemHeight(13).gap(5))
        .renderTitle(true);  // (optional) whether chart should render titles, :default = false

	/* CHART 3 */
    dc.pieChart("#chart-ring-duration").width(250) 
        .height(150) 
        .transitionDuration(500) 
        .innerRadius(30).colors(d3.scale.category10()).dimension(BerthingDurationCategoryDimension) 
        .group(BerthingDurationCategoryGroup) 
        .label(function(d) {
            return d.data.key;
        }).renderLabel(true).title(function(d) {
            return d.data.value;
        }).renderTitle(true);

	/* CHART 4 */
    dc.pieChart("#chart-ring-delta").width(250) 
        .height(150)
        .transitionDuration(500) 
        .innerRadius(30).colors(d3.scale.category10()).dimension(DeltaDurationCategoryDimension) 
        .group(DeltaDurationCategoryGroup) 
        .label(function(d) {
            return d.data.key;
        }).renderLabel(true).title(function(d) {
            return d.data.key;
        }).renderTitle(true);

	/* CHART 5 */
    var rowChart = dc.rowChart("#chart-row-delayactivit");
    rowChart.width(300).height(150).margins({
        top: 0,
        right: 10,
        bottom: 20,
        left: 20
    }).dimension(UnberthStatusDimension).group(UnberthStatusGroup).renderLabel(
        true).colorDomain([0, 0]).colors(d3.scale.category10()).elasticX(
        true).xAxis().ticks(4);

	/* CHART 6 */
   var RainRowChart = dc.rowChart("#chart-row-weather");
    RainRowChart.width(300).height(150).margins({
            top: 0,
            right: 10,
            bottom: 20,
            left: 20
        }).dimension(RainDimension).group(RainGroup).renderLabel(true).colorDomain(
            [0, 0]).colors(d3.scale.category10()).elasticX(true).xAxis()
        .ticks(4);

	/* CHART 7 */
    var RainPeriodRowChart = dc.rowChart("#chart-row-weatherperiod");
    RainPeriodRowChart.width(300).height(150).margins({
        top: 0,
        right: 10,
        bottom: 20,
        left: 20
    }).dimension(RainPeriodDimension).group(RainPeriodGroup).renderLabel(
        true).colorDomain([0, 0]).colors(d3.scale.category10()).elasticX(
        true).xAxis().ticks(4);

	/* CHART 8 */
    var vesselTypeChart = dc.barChart("#chart-row-vesseltype");
    vesselTypeChart.width(1100).height(200).margins({
            top: 10,
            right: 20,
            bottom: 20,
            left: 40
        }).dimension(actualBerthDim).group(VesselTypeGroup).valueAccessor(
            function(d) {
                return d.value.vesselCount;
            }).transitionDuration(1500).centerBar(true).centerBar(true)
        .gap(23).x(d3.time.scale().domain([minDate, maxDate]))
        .y(d3.scale.linear().domain([0, 1])).elasticY(true).elasticX(
            true).renderTitle(true).title(function(d) {
            return 'test: ' + d.value;
        }).renderHorizontalGridLines(true).label(function(d) {
              return 'test';
        })
		//.x(d3.scale.ordinal().domain(data.map(function(d){ return d.Berth })))
        //.xUnits(dc.units.ordinal)
    ;

	/* CHART 9 */
    var barChart = dc.barChart("#chart-bar-berth");
    barChart.width(1100).height(200).colors(d3.scale.category10()).margins({
            top: 10,
            right: 10,
            bottom: 60,
            left: 40
        }).dimension(berthDimension).renderHorizontalGridLines(true)
        .group(berthGroup).transitionDuration(1500).centerBar(true).gap(
            2).x(d3.scale.ordinal().domain(data.map(function(d) {
            return d.Berth
        }))).xUnits(dc.units.ordinal).y(d3.scale.linear().domain([0, 1]))
        .elasticY(true).elasticX(true).xAxis().tickFormat(function(v) {
            return v;
        });
    barChart.renderlet(function(chart) {
        chart.selectAll("g.x text").attr('dx', '-30').attr('dy',
            '-7').attr('transform', "rotate(-90)");
    })

	/* CHART 10 */	
    var barChart = dc.barChart("#chart-bar-vessel");
    barChart.width(1100).height(200).margins({
        top: 10,
        right: 10,
        bottom: 60,
        left: 40
    }).dimension(vesselDimension).group(vesselGroup).transitionDuration(
        1500).centerBar(true).gap(2).x(d3.scale.ordinal().domain(
        data.map(function(d) {
            return d.VesselType
        }))).xUnits(dc.units.ordinal).y(d3.scale.linear().domain([0,
        1
    ])).elasticY(true).elasticX(true).xAxis().tickFormat(function(v) {
        return v;
    });
    barChart.renderlet(function(chart) {
            chart.selectAll("g.x text").attr('dx', '-30').attr('dy',
                '-7').attr('transform', "rotate(-90)");
        })

	/* CHART 11 */    
    var barChart = dc.barChart("#chart-bar-vesselcount");
    barChart.width(1100).height(150).margins({
            top: 10,
            right: 10,
            bottom: 10,
            left: 40
        }).dimension(vesselIDDimension).group(vesselIDDimensionGroup).transitionDuration(
            1500).centerBar(true).gap(2).x(d3.scale.ordinal().domain(
            data.map(function(d) {
                return d.Vessel_ID
            }))).xUnits(dc.units.ordinal).y(d3.scale.linear().domain([0,1])).elasticY(true).elasticX(true).ordering(function(d) {
            return d.key;
        })
		
        //.xAxis().tickFormat(function(v) {return "";})
        //.cap(10)
    ;
    barChart.renderlet(function(chart) {
        chart.selectAll("g.x text").attr('dx', '-30').attr('dy',
            '-7').attr('transform', "rotate(-90)");
    })
	
	/* CHART 12 */
    var rainlineChart = dc.lineChart("#chart-line-hitsperday");
    rainlineChart.width(1100).height(220).margins({
            top: 10,
            right: 10,
            bottom: 60,
            left: 40
        }).dimension(rainDimension)
        .group(rainPerformanceGroup).valueAccessor(function(d) {
            return d.value.avgIndex;
        }).renderArea(true).x(d3.time.scale().domain([minDate, maxDate]))
        .elasticX(true);
	//.legend(dc.legend().x(60).y(10).itemHeight(13).gap(5))
    //.yAxisLabel("Rainfall mm")	
    //.x(d3.scale.ordinal().domain(data.map(function(d){ return d.Berth })))
    //.xUnits(dc.units.ordinal)
    //.brushOn(false)
    ;

	/* DATA TABLE 1 */
	 datatable = $("#dc-data-table").dataTable({
        "bDeferRender": true,
        "aaData": BerthScheduleStatusDimension.top(5),
        "iDisplayLength": 5,
        "aLengthMenu": [
            [5, 50, 100, -1],
            [5, 50, 100, "All"]
        ],
        //"sDom": '<"top">rt<"bottom"ip><"clear">',
        "bDestroy": true,
        "aoColumns": [{
            "mData": function(source) {
                var resObj = {
                    'Vessel_ID': source.Vessel_ID,
                    'Berth': source.Berth,
                }
                return resObj;
            },
            'mRender': function(resObj) {
                var res = '<strong>' + resObj.Vessel_ID +
                    '</strong>';
                return res;
            },
            "sDefaultContent": " "
        }, {
            "mData": function(source) {
                var resObj = {
                    'Vessel_ID': source.Vessel_ID,
                    'Berth': source.Berth,
                }
                return resObj;
            },
            'mRender': function(resObj) {
                var res = '' + resObj.Berth + '';
                return res;
            },
            "sDefaultContent": " "
        }, {
            "mData": function(d) {
                var resObj = {
                    'EstBerthDuration': d.EstBerthDuration,
                    'ActBerthDuration': d.ActBerthDuration,
                    'ComBerthStatus': d.ComBerthStatus,
                    'ComUnberthStatus': d.ComUnberthStatus,
                    'ETB': d.ETB,
                    'ETU': d.ETU,
                    'ATB': d.ATB,
                    'ATU': d.ATU,
                }
                return resObj;
            },
            'mRender': function(d) {
                var res = "Est Duration: " + d.EstBerthDuration +
                    "min - Act Duration: " + d.ActBerthDuration +
                    "min <br/>Berth Period: " + d.ComBerthStatus +
                    " - Unberth Period: " + d.ComUnberthStatus +
                    "<div class='metadata'>ETB " +
                    d.ETB + " <br>ATB " + d.ATB +
                    " <br>ETU " + d.ETU +
                    " <br>ATU " + d.ATU + "</div>";
                return res;
            },
            "sDefaultContent": " "
        }, {
            "mData": function(d) {
                var resObj = {
                    'RainfallCategory': d.RainfallCategory,
                    'TB1': d.TB1,
                    'Total_Duration': d.Total_Duration,
                    'Max_DBT': d.Max_DBT,
                    'Max_RH': d.Max_RH,
                    'Prevailing_Wind_Direction': d
                        .Prevailing_Wind_Direction,
                }
                return resObj;
            },
            'mRender': function(d) {
                var res = d.RainfallCategory +
                    "<br/>" + d.TB1 + "mm(" + d.Total_Duration +
                    "mins)<br/>Temp :" + d.Max_DBT +
                    " Humidity: " + d.Max_RH +
                    "<br/>Wind: " + d.Prevailing_Wind_Direction;
                return res;
            },
            "sDefaultContent": " "
        }, {
            "mData": function(d) {
                var resObj = {
                    'vslFlag_c': d.vslFlag_c,
                    'VesselType': d.VesselType,
                }
                return resObj;
            },
            'mRender': function(d) {
                var res = "Flag: " + d.vslFlag_c +
                    "<br/>Type: " + d.VesselType;
                return res;
            },
            "sDefaultContent": " "
        }, ]
    });
    // MakeDataTable Button
    document.getElementById("makeDataTable").onclick = function() {
        alldata = BerthScheduleStatusDimension.top(Infinity);
        RefreshTable(alldata);
    };
    /********************************************************
     *														*
     * 	Step6: 	Render the Charts							*
     *														*
     ********************************************************/
    dc.renderAll();
});