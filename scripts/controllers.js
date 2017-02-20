/* global angular */

'use strict';
function kendoPrint() {
    kendo.drawing.drawDOM($("#printablereport"), {
        avoidLinks: true,
        paperSize: "A4",
        margin: '1cm',
        scale: 0.8
    }).then(function (group) {
        kendo.drawing.pdf.saveAs(group, "Converted PDF.pdf");
    });
}
function browserPrint() {
    window.print();
    return true;
}
function browserPrint2() {
    var mywindow = window.open('', 'PRINT', 'height=400,width=600');
    mywindow.document.write('<html><head><title>' + document.title + '</title>');

    mywindow.document.write('</head><body >');
    mywindow.document.write(document.getElementById("printablereport").innerHTML);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*!/
    setInterval(function () {
        mywindow.print();
        mywindow.close();
    })
    return true;
}
/* Controllers */
var appControllers = angular.module('appControllers', [])
    .controller('SubmissionStatusReportController', function ($scope, DHIS2URL, $http, $sce, $timeout, $filter, $window, $location, $routeParams, ReportService, toaster) {
        $scope.data = {
            selectedOrgUnit: undefined,
            config: {},
            archive: undefined,
            dataSets: [],
            criteria: "registration",
            period: "",
            periodTypeName: "",
            periodType: [
                {name: "Monthly"},
                {name: "Quarterly"},
                {name: "Yearly"},
                {name: "FinancialJuly"},
            ],
            periodTypes: {
                "Monthly": {
                    currentDate: new Date(),
                    next: function () {
                        this.currentDate = new Date(this.currentDate.getFullYear() + 1, this.currentDate.getMonth(), this.currentDate.getDate());
                        this.populateList();
                    },
                    previous: function () {
                        this.currentDate = new Date(this.currentDate.getFullYear() - 1, this.currentDate.getMonth(), this.currentDate.getDate());
                        this.populateList();
                    },
                    name: "Monthly", value: "Monthly", allowNext: true, allowPrevious: true, list: [],
                    populateList: function () {
                        //this.allowNext = true;
                        var monthNames = ["July", "August", "September", "October", "November", "December", "January", "February", "March", "April", "May", "June"];
                        /*if (!date) {
                         date = new Date();
                         }*/
                        this.list = [];
                        var that = this;
                        var year = this.currentDate.getFullYear();
                        monthNames.forEach(function (monthName, index) {
                            var monthVal = index + 7;

                            if (monthVal > 12) {
                                monthVal = monthVal % 12;
                            }
                            if (monthVal == 1) {
                                year++;
                            }
                            var testDate = new Date();
                            if ((year == testDate.getFullYear() && monthVal > (testDate.getMonth() + 1)) || year > testDate.getFullYear()) {

                                return;
                            }
                            if (monthVal < 10) {
                                monthVal = "0" + monthVal;
                            }
                            if (!(testDate.getMonth() + 1 == monthVal && testDate.getFullYear() == year)) {
                                that.allowNext = true;
                                that.list.unshift({
                                    name: monthName + " " + year,
                                    value: year + "" + monthVal
                                })
                            }

                        });
                        if (this.list.length == 0) {
                            this.currentDate = new Date(this.currentDate.getFullYear() - 1, this.currentDate.getMonth(), this.currentDate.getDate());
                            this.populateList();
                            that.allowNext = false;
                        }
                    }
                },
                "Quarterly": {
                    currentDate: new Date(),
                    next: function () {
                        this.currentDate = new Date(this.currentDate.getFullYear() + 1, this.currentDate.getMonth(), this.currentDate.getDate());
                        this.populateList();
                    },
                    previous: function () {
                        this.currentDate = new Date(this.currentDate.getFullYear() - 1, this.currentDate.getMonth(), this.currentDate.getDate());
                        this.populateList();
                    },
                    name: "Quarterly", value: "Quarterly", allowNext: true, allowPrevious: true, list: [],
                    populateList: function () {
                        var quarters = ["July - September", "October - December", "January - March", "April - June"];
                        this.list = [];
                        var that = this;
                        var year = this.currentDate.getFullYear();

                        quarters.forEach(function (quarter, index) {
                            var quarterVal = index + 3;
                            if (quarterVal == 5) {
                                quarterVal = 1;
                            }
                            if (quarterVal == 6) {
                                quarterVal = 2;
                            }
                            if (quarterVal == 1) {
                                year++;
                            }
                            var testDate = new Date();
                            if (year > testDate.getFullYear() || (Math.ceil((testDate.getMonth() + 1) / 3) <= quarterVal && year == testDate.getFullYear())) {
                                return;
                            }
                            //if (!(Math.ceil((testDate.getMonth() + 1) / 3) < quarterVal && testDate.getFullYear() == year))
                            {
                                that.list.unshift({
                                    name: quarter + " " + year,
                                    value: year + "Q" + quarterVal
                                });
                                that.allowNext = true;
                            }
                        });
                        if (this.list.length == 0) {
                            this.currentDate = new Date(this.currentDate.getFullYear() - 1, this.currentDate.getMonth(), this.currentDate.getDate());
                            this.populateList();
                            that.allowNext = false;
                        }
                    }
                },
                "Yearly": {

                    name: "Yearly", value: "Yearly", list: [],
                    populateList: function () {
                        var that = this;
                        this.list = [];
                        for (var i = this.currentDate.getFullYear() - 2; i < this.currentDate.getFullYear(); i++) {
                            this.list.unshift({name: "" + i});
                        }

                        if (this.list.length == 0) {
                            this.currentDate = new Date(this.currentDate.getFullYear() - 1, this.currentDate.getMonth(), this.currentDate.getDate());
                            this.populateList();
                            that.allowNext = false;
                        }
                    }
                },

                "FinancialJuly": {
                    currentDate: new Date(),
                    next: function () {
                        this.currentDate = new Date(this.currentDate.getFullYear() + 5, this.currentDate.getMonth(), this.currentDate.getDate());
                        this.populateList();
                    },
                    previous: function () {
                        this.currentDate = new Date(this.currentDate.getFullYear() - 5, this.currentDate.getMonth(), this.currentDate.getDate());
                        this.populateList();
                    },
                    name: "Financial-July", value: "FinancialJuly", allowNext: false, allowPrevious: true, list: [],
                    populateList: function () {
                        var date = new Date();
                        this.list = [];

                        for (var i = this.currentDate.getFullYear() - 4; i <= this.currentDate.getFullYear(); i++) {

                            if (i == this.currentDate.getFullYear() && date.getMonth() < 6) {

                                continue;
                            }

                            if (date.getMonth() < 6 && i + 1 == this.currentDate.getFullYear() && date.getMonth()) {

                                continue;
                            }
                            this.list.unshift({name: "July " + i + " - June " + (i + 1), value: i + "July"});


                        }
                        if (this.currentDate.getFullYear() == (new Date).getFullYear()) {
                            this.allowNext = false;
                        } else {
                            this.allowNext = true;
                        }
                    }
                }
            }
        };
        $scope.sqlView = "hjJqUbcxXxO";

        $scope.displayPreviousPeriods = function () {
            $scope.data.periodTypes[$scope.data.dataSet.periodType].previous();
        };
        $scope.displayNextPeriods = function () {
            $scope.data.periodTypes[$scope.data.dataSet.periodType].next();
        };
        $scope.getPeriodType = function (name) {
            var retPeriodType;
            $scope.data.periodTypes.forEach(function (periodType) {
                if (name == periodType.name) {
                    retPeriodType = periodType;
                }
            });
            return retPeriodType;
        }
        var inArray = function (arrayList, comparableValue) {
            var exist = false;
            arrayList.forEach(function (data) {
                if (data == comparableValue) {
                    exist = true;
                    return false;
                }
            })
            return exist;
        }

        /**
         * This function fake model change in order to triger filtering
         * */
        $scope.fakeDataSetModalChange = function (backupDataset) {

            $scope.data.dataSets = [];
            $scope.data.dataSets = backupDataset;

        }
        $scope.filteredForms = [];
        $scope.selective = function (inputValue) {
            var dataSetTobeFiltered = ['Prior Estimates for Missing Data Estimation Entry Form'];

            if ($scope.filteredForms.length > 0) {
                $scope.filteredForms.push(dataSetTobeFiltered[0]);
                dataSetTobeFiltered = $scope.filteredForms;
            }
            if (!inArray(dataSetTobeFiltered, inputValue.name)) {
                return inputValue;
            }

        }


        $scope.filterPeriodType = function (inputValue) {

            if (inArray($scope.periodTypesToShow,inputValue.name))
            {
                return inputValue;
            }




        }

        $scope.$watch("data.dataSet", function (value) {
            if (value) {
                $scope.data.period = "";
                $scope.data.periodTypes[value.periodType].populateList();
            }
        });


        $scope.loadingArchive = false;

        $scope.archiveDataElements = [];
        $scope.loadTracker = "Loading Data Sets";
        $scope.setOrganisationUnitSelection = function (orgUnit) {
            if (orgUnit.id == $routeParams.orgUnit) {
                $scope.data.config.toggleSelection(orgUnit);
            } else if (orgUnit.children) {
                orgUnit.children.forEach(function (child) {
                    $scope.setOrganisationUnitSelection(child);
                })
            }
        }
        $scope.disableForDataSet = false;

            $scope.$watch("data.dataSet",function(dataSetSelected){
                $scope.periodTypesToShow = [];

                if (dataSetSelected){
                    $scope.disableForDataSet = false;


                    if ( dataSetSelected.periodType == "FinancialJuly" )
                    {
                        $scope.periodTypesToShow.push("FinancialJuly");
                    }

                    if ( dataSetSelected.periodType == "Quarterly" )
                    {
                        $scope.periodTypesToShow.push("FinancialJuly");
                        $scope.periodTypesToShow.push("Quarterly");
                    }

                    if ( dataSetSelected.periodType == "Monthly" )
                    {
                        $scope.periodTypesToShow.push("FinancialJuly");
                        $scope.periodTypesToShow.push("Quarterly");
                        $scope.periodTypesToShow.push("Monthly");
                    }

                }else{
                    $scope.disableForDataSet = true;
                }

        })

        $scope.doesValueExist = function (period) {
            var returnVal = false;
            $scope.data.periodTypes[$scope.data.dataSet.periodType].list.forEach(function (p) {
                if (p.value == period) {
                    returnVal = true;
                }
            })
            return returnVal;
        }
        $http.get(DHIS2URL + "api/dataSets.json?fields=id,name,periodType,attributeValues[value,attribute[name]],organisationUnits[id]&filter=name:like:Entry Form").then(function (results) {
            $scope.data.dataSets = results.data.dataSets;
            $scope.loadTracker = undefined;
            var fakeDataSetArray = [];
            $scope.data.dataSets.forEach(function (dataSet) {
                if ($routeParams.dataSet) {
                    if (dataSet.id == $routeParams.dataSet) {
                        $scope.data.dataSet = dataSet;
                    }
                }

                if (dataSet.name == "Ward Annual Target Entry Form (WF00)") {
                    dataSet.sortOrder = 1;
                    fakeDataSetArray[0] = dataSet;
                } else if (dataSet.name == "Ward Monthly Entry Form (WF01)") {
                    dataSet.sortOrder = 2;
                    fakeDataSetArray[1] = dataSet;
                } else if (dataSet.name == "Ward Quarterly Entry Form (WF02)") {
                    dataSet.sortOrder = 3;
                    fakeDataSetArray[2] = dataSet;
                } else if (dataSet.name == "Ward Annual Entry Form (WF03)") {
                    dataSet.sortOrder = 4;
                    fakeDataSetArray[3] = dataSet;
                } else if (dataSet.name == "District Quarterly Entry Form (DF02)") {
                    dataSet.sortOrder = 5;
                    fakeDataSetArray[4] = dataSet;
                } else if (dataSet.name == "District Annual Entry Form (DF03)") {
                    dataSet.sortOrder = 6;
                    fakeDataSetArray[5] = dataSet;
                }


            });
            $scope.data.dataSets = fakeDataSetArray;
            /**
             * This checking is done after all dataset are loaded
             * */
            $scope.backupDataset = $scope.data.dataSets;
            $scope.$watch("data.selectedOrgUnit", function (selectedOrgUnit) {
                if (selectedOrgUnit) {


                    if (selectedOrgUnit.level == 4) {

                        $scope.data.dataSets.forEach(function (dataSet) {
                            if (dataSet.name.indexOf('District') >= 0) {
                                $scope.filteredForms.push(dataSet.name);
                            }
                        })

                    } else {
                        $scope.filteredForms = [];
                    }
                    $scope.fakeDataSetModalChange($scope.backupDataset);
                }
            });

            ReportService.getUser().then(function (results) {
                var orgUnitIds = [];
                results.organisationUnits.forEach(function (orgUnit) {
                    orgUnitIds.push(orgUnit.id);
                });
                $http.get(DHIS2URL + "api/organisationUnits.json?filter=id:in:[" + orgUnitIds + "]&fields=id,name,level,children[id,name,level,children[id,name,level,children[id,name,level,children[id,name,level,children]]]]")
                    .then(function (results) {
                        $scope.data.organisationUnits = results.data.organisationUnits;
                        $scope.data.organisationUnits.forEach(function (orgUnit) {

                            ReportService.sortOrganisationUnits(orgUnit);
                        });
                        if ($routeParams.dataSet) {
                            $timeout(function () {
                                $scope.data.organisationUnits.forEach(function (orgUnit) {
                                    $scope.setOrganisationUnitSelection(orgUnit);
                                })
                            })
                            while (!$scope.doesValueExist($routeParams.period)) {
                                if ($scope.data.periodTypes[$scope.data.dataSet.periodType].currentDate.getFullYear() < 2011) {
                                    break;
                                }
                                $scope.data.periodTypes[$scope.data.dataSet.periodType].previous();
                            }

                            $timeout(function () {
                                $scope.data.period = $routeParams.period;
                            })
                        }
                        $scope.loadTracker = undefined;
                    }, function (error) {
                        $scope.data.organisationUnits = [];
                        toaster.pop('error', "Error" + error.status, "Error Loading Organisation Units. Please try again");
                    });
            });

            /**
             * Watching $scope.data.dataSets to control period type
             * */


        }, function (error) {
            $scope.loadTracker = undefined;
            toaster.pop('error', "Error" + error.status, "Error Loading Data Sets. Please try again");
        });
        $scope.removeTrustedHtml = function () {
            $scope.trustedHtml = false;
        }

        $scope.data.completeness = "<p></p>";
        $scope.getReport = function (reportType) {

            if (!$scope.data.selectedOrgUnit) {
                toaster.pop('warning', "Warning", "Please select Administrative Unit");
                return false;
            }

            if ($scope.data.period == "") {
                toaster.pop('warning', "Warning", "Please select Period");
                return false;
            }


            if (!$scope.data.dataSet) {
                toaster.pop('warning', "Warning", "Please select Dataset");
                return false;
            }

            $scope.loadTracker = undefined;
            $scope.data.completeness = null;
            $http.get(DHIS2URL + "api/sqlViews/" + $scope.sqlView + "/data.json?var=uid:" + $scope.data.dataSet.id).then(function (results) {

                var dataSetUid = null;
                if (results.data.rows && results.data.rows.length > 0) {
                    dataSetUid = results.data.rows[0][0];
                }

                $http({
                    method: "post",
                    url: DHIS2URL + "dhis-web-commons/oust/setorgunit.action",
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    data: "&id=" + $scope.data.selectedOrgUnit.id
                }).success(
                    function (selectedOrgUnit) {
                        var completenessUrl = DHIS2URL + "dhis-web-reporting/getDataCompleteness.action?periodId=" + $scope.data.period + "&criteria=" + $scope.data.criteria + "&dataSetId=" + dataSetUid + "&type=" + reportType;
                        $scope.loadTracker = undefined;
                        if (reportType != "html") {
                            $scope.data.completeness = "<p></p>";
                            $window.open(completenessUrl, '_blank');
                            $scope.loadTracker = undefined;
                            return false;
                        }

                        $http.get(completenessUrl).then(function (completenessResults) {

                            if (reportType == "html") {
                                $scope.data.completeness = completenessResults.data;
                            }


                        }, function (error) {
                            $scope.loadTracker = undefined;
                            toaster.pop('error', "Error" + error.status, "Error Loading Completeness. Please try again");
                        });
                    }
                );

            }, function (error) {
                $scope.loadTracker = undefined;
                toaster.pop('error', "Error" + error.status, "Error Loading Completeness. Please try again");
            });

        }


        $scope.allowAnalytics = false;
        ReportService.getUser().then(function (user) {
            $scope.user = user;
            $scope.user.userCredentials.userRoles.forEach(function (role) {
                if ((role.authorities.indexOf("F_DATA_MART_ADMIN") > -1) || (role.authorities.indexOf("ALL") > -1)) {
                    $scope.allowAnalytics = true;
                }
            })
        });


    })
