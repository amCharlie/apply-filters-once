'use strict';

(function () {
	
	let unregisterHandlerFunctions = [];
	
  $(document).ready(function () {
	$('#loading').removeClass('hidden').addClass('hidden');
	tableau.extensions.initializeAsync()
	$('#apply').click(applyAllFilters);  
  });

  // apply all selected filters
  function applyAllFilters () {
	$('#loading').removeClass('hidden').addClass('show');
   // alert("apply all filters!")
   // Initialization succeeded! Get the dashboard
   let dashboard = tableau.extensions.dashboardContent.dashboard;
   let filterFetchPromises = [];
   
   let worksheetFiltersPromiss = [];
   let worksheet_dict = {}
   dashboard.worksheets.forEach(function (worksheet) {
	   worksheet_dict[worksheet.name] = worksheet;
	   worksheetFiltersPromiss.push(worksheet.getFiltersAsync());
   });
   
   
   Promise.all(worksheetFiltersPromiss).then(function (fetchResults) {
	   let k_filters = [];
		fetchResults.forEach(function (worksheetFilters) {
		  worksheetFilters.forEach(function (filter) {
			  var f_name = filter.fieldName;
			  if (f_name.substr(0, 2) == 'k_') {
				  // alert(f_name);
				  k_filters.push(filter);
			  }
		  });
		});
		
		 // 封装刷新参数
		  var worksheet_list = [];
		  var apply_filter_list = [];
		  var apply_values_list = [];
		  var apply_type_list = [];
		  
		  for (var i = 0; i < k_filters.length; i++) {
			  var filter = k_filters[i];
			  var f_name = filter.fieldName.substring(2,);
			  var all_selected = filter.isAllSelected; 
			  var f_type = filter.filterType;
			  var vals = filter.appliedValues;
			  var vals_array = [];
			  var apply_type = "";
			  var len = vals.length;
			  if (len > 0 || (len == 0 && all_selected == false)){
				  for (var j = 0; j < vals.length; j++) {
						var v = vals[j].formattedValue;
						vals_array.push(v);
				  }
				  apply_type = 'replace';
			  } else if(len == 0 && all_selected == true) {
				  apply_type = 'all';
			  }
			  
			  fetchResults.forEach(function (worksheetFilters) {
				  let k_filters = [];
				  worksheetFilters.forEach(function (filter) {
					  var f_name_1 = filter.fieldName;
					  if (f_name_1 == f_name) {
						  var worksheet = worksheet_dict[filter.worksheetName];
						  worksheet_list.push(worksheet);
						  apply_filter_list.push(f_name_1);
						  apply_values_list.push(vals_array);
						  apply_type_list.push(apply_type);
					  }
				  });
			  });
		  }
		  
		  let apply_all_list = [];
		  for (var i = 0; i < worksheet_list.length; i++) {
			  apply_all_list.push(worksheet_list[i].applyFilterAsync(apply_filter_list[i], apply_values_list[i], apply_type_list[i], false));
		  }

			Promise.all(apply_all_list).then(function (){
				 $('#loading').removeClass('hidden').addClass('hidden');
			});
		
	  });
  
  }
  
})();
