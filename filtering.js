'use strict';

(function () {
	
	let unregisterHandlerFunctions = [];
	
  $(document).ready(function () {
	tableau.extensions.initializeAsync()
	$('#apply').click(applyAllFilters);  
  });

  // apply all selected filters
  function applyAllFilters () {
	alert("数据刷新中...");
   // alert("apply all filters!")
   // Initialization succeeded! Get the dashboard
   let dashboard = tableau.extensions.dashboardContent.dashboard;
   
   let filterFetchPromises = [];
   
   let record_filter_applied_values = {}
   
   dashboard.worksheets.forEach(function (worksheet) {
      worksheet.getFiltersAsync().then(function (filtersForWorksheet) {
        filtersForWorksheet.forEach(function (filter) {
			var f_name = filter.fieldName;
			// if (f_name == 'BG' || f_name == 'k_BG'){
			//		alert('读取到筛选器：' + f_name);
			//}
			var all_selected = filter.isAllSelected; 
			var f_type = filter.filterType;
			var vals = filter.appliedValues;
			var vals_array = [];
	
			if (f_name.substr(0, 2) == 'k_') {
				try {
					var len = vals.length;
					// alert(len);
					if (len > 0 || (len == 0 && all_selected == false)){
						for (var i = 0; i < vals.length; i++) {
							var v = vals[i].formattedValue;
							vals_array.push(v);
						}
						
					   dashboard.worksheets.forEach(function (worksheet_1) {
						worksheet_1.getFiltersAsync().then(function (filtersForWorksheet_1) {
							filtersForWorksheet_1.forEach(function (filter_1) {
								var f_name_1 = filter_1.fieldName;
								if (f_name.substring(2,) == f_name_1){
									// if (f_name == 'BG' || f_name == 'k_BG'){
									// 	alert("将" + f_name + "的筛选值应用于" + f_name_1);
									// }
									worksheet_1.applyFilterAsync(f_name_1, vals_array, 'replace', false);
								}
							});
						});
					   });
				  } else if (len == 0 && all_selected == true) {
					  dashboard.worksheets.forEach(function (worksheet_1) {
						worksheet_1.getFiltersAsync().then(function (filtersForWorksheet_1) {
							filtersForWorksheet_1.forEach(function (filter_1) {
								var f_name_1 = filter_1.fieldName;
								if (f_name.substring(2,) == f_name_1){
									// if (f_name == 'BG' || f_name == 'k_BG'){
									// 	alert("将" + f_name + "的筛选值应用于" + f_name_1);
									// }
									worksheet_1.applyFilterAsync(f_name_1, vals_array, 'all', false);
								}
							});
						});
					   });
				  }
				} catch(err) {
					alert("error");
				}
			}
        });
		
      });
    });
	
	alert("数据刷新完成！");
  }
  
})();
