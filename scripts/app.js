'use strict';

/* App Module */

angular.module('app',
    ['ui.bootstrap',
        'ngRoute',
        'ngCookies',
        'ngSanitize',
        'appDirectives',
        'appControllers',
        'appServices',
        'appFilters',
        'd2Services',
        'd2Controllers',
        'pascalprecht.translate',
        'd2HeaderBar', 'FileManagerApp', 'toaster'
    ])

    .value('DHIS2URL', '../../../')
    .config(function ($translateProvider, $routeProvider, fileManagerConfigProvider,$httpProvider) {
        var defaults = fileManagerConfigProvider.$get();
        fileManagerConfigProvider.set({
            appName: 'Submission Status',
            allowedActions: angular.extend(defaults.allowedActions, {
                remove: true
            })
        });
        $routeProvider.when('/', {
            redirectTo: '/Submission-Status'
        }).when('/Submission-Status', {
            controller: 'SubmissionStatusReportController',
            templateUrl: 'views/submissionStatus/submissionStatus.html'
        }).otherwise({
            redirectTo: '/Submission-Status'
        });

        $translateProvider.preferredLanguage('en');
        $translateProvider.useSanitizeValueStrategy('escaped');
        $translateProvider.useLoader('i18nLoader');
        $httpProvider.interceptors.push('myHttpInterceptor');
    });