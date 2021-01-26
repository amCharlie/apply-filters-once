'use strict';

(function () {
  let init_k_filters = {};
  let init_done = false;
  $(document).ready(function () {
	$('#loading').removeClass('hidden').addClass('hidden');
	tableau.extensions.initializeAsync()
	
	$('#apply').click(applyAllFilters);  
	
	setTimeout(function(){
		getInitKFilters();
	}, 3000);
	
  });

  // 获取初始状态下的k_filters
  function getInitKFilters() {
	  let dashboard = tableau.extensions.dashboardContent.dashboard;

	  let worksheetFiltersPromiss = [];
	  dashboard.worksheets.forEach(function (worksheet) {
		  worksheetFiltersPromiss.push(worksheet.getFiltersAsync());
	  });

	  Promise.all(worksheetFiltersPromiss).then(function (fetchResults) {
		fetchResults.forEach(function (worksheetFilters) {
			worksheetFilters.forEach(function (filter) {
			  var f_name = filter.fieldName;
			  if (f_name.substr(0, 2) == 'k_') {
				init_k_filters[f_name] = filter;
			  }
			});
		});
		init_done = true;
	  });
  }


  // apply all selected filters
  function applyAllFilters () {
   let start = Date.now();
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
	   let k_filters = [];				// 存放所有k_开头的筛选器
	   let fname_filter_dict = {};		// 存放当前筛选器名字和筛选器对象mapping的字段，其中筛选器对象是[]存储
	   let new_init_filters = {};
	   fetchResults.forEach(function (worksheetFilters) {
		  worksheetFilters.forEach(function (filter) {
			  var f_name = filter.fieldName;
			  if (f_name in fname_filter_dict) {
				  fname_filter_dict[f_name].push(filter);
			  } else {
				  fname_filter_dict[f_name] = [filter];
			  }
			  
			  // 这里遍历k_开头的筛选器需要做两件事：1将当前筛选器对象保存，2对比上一版本保存的筛选器对象，判断是否有发生变化
			  
			  if (f_name.substr(0, 2) == 'k_') {
				  new_init_filters[filter.fieldName] = filter;
				  if (filter.fieldName in init_k_filters) {
					  // alert('in init_k_filters')
					  let old_filter = init_k_filters[filter.fieldName];
					  if (old_filter.isAllSelected != filter.isAllSelected || old_filter.isExcludeMode != filter.isExcludeMode || !compareValues(old_filter.appliedValues, filter.appliedValues)) {
						  // alert(filter.fieldName + 'changed')
						  k_filters.push(filter);
					  } 
					  // else {
						  // alert(filter.fieldName + ' not changed')
					  // }
				  } else {
					  // alert('not in init_k_filters')
					  k_filters.push(filter);
				  }
			  }
		});
	});
	init_k_filters = new_init_filters;
	// alert("本次更新的筛选器有" + k_filters.length + "个");
		
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
		  
		  // 获取去掉k_前缀后，重名的筛选器
		  let same_name_filters = []
		  
		  // alert(fname_filter_dict);
		  if (f_name in fname_filter_dict) {
			  same_name_filters = fname_filter_dict[f_name]
		  }
		  for (var j = 0; j < same_name_filters.length; j++) {
			  let o_filter = same_name_filters[j];

			  var worksheet = worksheet_dict[o_filter.worksheetName];
			  worksheet_list.push(worksheet);
			  apply_filter_list.push(o_filter.fieldName);
			  apply_values_list.push(vals_array);
			  apply_type_list.push(apply_type);
		  }
	  }

	  let apply_all_list = [];
	  for (var i = 0; i < worksheet_list.length; i++) {
		  apply_all_list.push(worksheet_list[i].applyFilterAsync(apply_filter_list[i], apply_values_list[i],apply_type_list[i], false));
	  }
	  // alert("共循环作用了" + worksheet_list.length + "次");

	  Promise.all(apply_all_list).then(function (){
		  $('#loading').removeClass('hidden').addClass('hidden');
		  let end = Date.now();
		  // alert("共耗时" + (end - start) / 1000 + "s");
	  });
	});
  }
  
  
  var sleep = function(time) {
	var startTime = new Date().getTime() + parseInt(time, 10);
	while(new Date().getTime() < startTime) {}
  };
  
  // 判断两组values是否完全一致，一致返回true
  function compareValues(valArray1, valArray2){
	  var val_str_list_1 = [];
	  var val_str_list_2 = [];
	  for (var i = 0; i < valArray1.length; i++) {
		 var v = valArray1[i].formattedValue;
		 val_str_list_1.push(v);
	  }

	  for (var i = 0; i < valArray2.length; i++) {
		 var v = valArray2[i].formattedValue;
		 val_str_list_2.push(v);
	  }
	  
	  if(val_str_list_1.length == val_str_list_2.length) {
		  for (var i = 0; i < val_str_list_1.length; i++) {
				var v = val_str_list_1[i];
				if (val_str_list_2.indexOf(v) == -1) {
					return false;
				}
		  }
	  } else {
		  return false;
	  }
	  return true;
  }
  
})();
