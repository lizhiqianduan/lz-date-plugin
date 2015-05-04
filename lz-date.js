/*
 * author : xiaohei
 * create time : 2014-12-11 10:44:05
 * file : lz-date.js
 * desc : 超简单日历插件,依赖于zepto或者jquery
 *
 */

(function($){
    function isString(str) {
        if (typeof(str) === "string")
            return true;
        else
            return false;
    }

    function isNum(str) {
        if (typeof(str) === "number")
            return true;
        else
            return false;
    }

    function isObj(str) {
        if (typeof(str) === "object")
            return true;
        else
            return false;
    }

    function isFn(str) {
        if (typeof(str) === "function")
            return true;
        else
            return false;
    }

    function isArr(str){
        if(Object.prototype.toString.call(str) === '[object Array]'){
            return true;
        }else
            return false;
    }

    function isMobile(){
        var userAgentInfo = window.navigator.userAgent;
        // console.log(userAgentInfo);
        var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                return true;
            }
        }
        return false;
    }
    //合并两个对象
    //将obj2合并到obj1
    function extend(newobj, obj1, obj2) {
        for (var i in obj1) {
            newobj[i] = obj1[i];
            if (obj2 && obj2[i] != null) {
                newobj[i] = obj2[i];
            }
        }
        return newobj;
    }


    /*
    * 插件名 ：lzDate
    * */
    $.fn.lzDate = function(userSettings){
        var defaultSet = {
            //当前日是否有样式，默认为.curDay
            curDayStyle:true,
            //这里模拟生成了两天的记录数据
            marks:[
                {
                    markDate:'20141214',
                    //默认生成 <i class='lzDate-'+markType>14<i class='lzDate-markText'>+1</i></i>样式
                    markType:'output',
                    markText:'+1'
                },
                {
                    markDate:'20141213',
                    //默认生成 .lzDate-input样式
                    markType:'input',
                    //默认生成 .lzDate-markText样式
                    markText:'+6'
                }
            ],
            clearMarksBeforeTurnPage:false,
            turnPageEndCallBack:null

        };
        var settings = extend({},defaultSet,userSettings);
        // 被选中元素 --> 只能有一个
        var $box = $(this).eq(0);

        var curYear = new Date().getFullYear();
        var curMonth = new Date().getMonth()+1;
        var curDay = new Date().getDate();

        //初始化
        (function init(){
            //插入头部模板
            var Template = '<div class="top">'
                              +      '<div class="lastMonth btn">'
                              +      '<'//'<img src="js/lz-date/lastMonth_btn_on.png" alt=""/>'
                              +      '</div>'
                              +  '<div class="monthTitle">'
                              +      '<div class="forCenter"><span class="year">2014</span>年<span class="month">12</span>月</div>'
                              +  '</div>'
                              +  '<div class="nextMonth btn">'
                              +      '>'//'<img src="js/lz-date/nextMonth_btn_on.png" alt=""/>'
                              +      '</div>'
                              +  '</div>'
                              +   '<div class="day_title">'
                              +       '<span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>'
                              +   '</div>'
                              +   '<div class="month_wrap">'
                              +   '</div>';
            $box.html(Template);
            $box.find(".top .year").eq(0).html(curYear);
            $box.find(".top .month").eq(0).html(curMonth);
            //初始化日期表
            createDaySpan(curYear,curMonth);

            bindEve();

        })()




        /*
        * 绑定事件函数
        *
        * */
        function bindEve(){
            var lastBtn = $box.find(".lastMonth");
            var nextBtn = $box.find(".nextMonth");

            if(isMobile()){
                bindTapEve();
                bindSwipeEve();
            }else{
                bindClickEve();
            }




            function bindTapEve(){
                //翻页下一个月
                nextBtn.on("tap",function(e){
                    toNextMonth();
                });
                //翻页上一个月
                lastBtn.on("tap",function(){
                    toLastMonth();
                });
            }

            function bindClickEve(){
                //翻页下一个月
                nextBtn.on("click",function(e){
                    toNextMonth();
                });
                //翻页上一个月
                lastBtn.on("click",function(){
                    toLastMonth();
                });
            }





        }

        //这两个swipe事件对新生成的标签没效果，无奈单独拿出来
        function bindSwipeEve(){
            var monthBody = $box.find(".month_body");
            monthBody.on("swipeLeft",function(){
                toNextMonth();
            });

            monthBody.on("swipeRight",function(){
                toLastMonth();
            });
        }

        /*
         * 转到下个月
         * 这个函数原本应该是bindEve()的私有函数，都怪该死的swipe
         * */
        function toNextMonth(){
            if(settings.clearMarksBeforeTurnPage){
                setMarks(null);
            }
            var yearBox = $box.find(".monthTitle .year");
            var monthBox = $box.find(".monthTitle .month");
            var year = yearBox.text();
            var month = monthBox.text();
            var year = parseInt(year);
            var month = parseInt(month);
            if(month==12){
                monthBox.text(1);
                yearBox.text(year+1);
            }else{
                monthBox.text(month+1);
            }
            createDaySpan(year,month+1);
            bindSwipeEve();

            $box.find(".month_body").eq(0).fadeOut(100,function(){
                $box.find(".month_body").eq(0).remove();
            });
            $box.find(".month_body").eq(1).css({
                left:"100%"
            });
            $box.find(".month_body").eq(1).css("display",'block');
            $box.find(".month_body").eq(1).animate({
                left:0
            },200,function(){
                if(isFn(settings.turnPageEndCallBack)){
                    settings.turnPageEndCallBack($box.find('.top .year').text(),$box.find('.top .month').text());
                }
            });
        }


        /*
         * 转到上个月
         * 这个函数原本应该是bindEve()的私有函数，都怪该死的swipe
         * */
        function toLastMonth(){
            if(settings.clearMarksBeforeTurnPage){
                setMarks(null);
            }
            var yearBox = $box.find(".monthTitle .year");
            var monthBox = $box.find(".monthTitle .month");
            var year = yearBox.text();
            var month = monthBox.text();
            var year = parseInt(year);
            var month = parseInt(month);
            if(month==1){
                monthBox.text(12);
                yearBox.text(year-1);
            }else{
                monthBox.text(month-1);
            }

            createDaySpan(year,month-1);
            bindSwipeEve();

            $box.find(".month_body").eq(0).fadeOut(100,function(){
                $box.find(".month_body").eq(0).remove();
            });
            $box.find(".month_body").eq(1).css({
                left:"-100%"
            });
            $box.find(".month_body").eq(1).css("display",'block');
            $box.find(".month_body").eq(1).animate({
                left:0
            },200,function(){
                if(isFn(settings.turnPageEndCallBack)){
                    settings.turnPageEndCallBack($box.find('.top .year').text(),$box.find('.top .month').text());
                }
            });
        }


        /*
        * 根据一个日期检查这一天是否被标记了
        * @param year : 年份的全称 2014
        * @param month : 月份数值 1--12 不允许以0开头
        * @param day : 日期数值1--31 不允许以0开头
        * 如果没标记返回false  如果标记了返回该标记对象
        * */

        function isMarked(year,month,day){
            var month = parseInt(month)-1;
            var day = parseInt(day);
            var thisFullDate = new Date(year,month,day);
            var year = thisFullDate.getFullYear();
            var month = thisFullDate.getMonth()+1;
            var day = thisFullDate.getDate();
            var month = month<=9?("0"+month):month;
            var day = day<=9?("0"+day):day;

            var thisDate = (""+year+month+day).trim();
            var marks = settings.marks;
            //不是数组或者数组长度为0，表示没有标记的天数
            if(!isArr(marks) || marks.length == 0){
                return false;
            }
            for(var i=0;i<marks.length;i++){
                var markDate = ("" + marks[i].markDate).trim();
                if(thisDate == markDate){
                    return marks[i];
                }
            }
            return false;
        }

        /*
        * @param year : 整型，必须是完整的年份 2014
        * @param month : 整型，必须在1-12之间,不允许以0开头
        * */
        function createDaySpan(year,month){
            var year = parseInt(year);
            var month = parseInt(month)-1;

            //当月第一天和最后一天的日期对象
            var firstFullDate = new Date(year,month,1);
            var lastFullDate = new Date(year,month+1,0);


            /*
            * 当月第一天和最后一天的号数，序号从1--31
            * */
            var firstDayDate = firstFullDate.getDate();
            var lastDayDate = lastFullDate.getDate();

            /*
             * 当月第一天和最后一天的星期数
             * 周日是0
             * 周六是6
             * */
            var firstDay = firstFullDate.getDay();
            var lastDay = lastFullDate.getDay();

            /*
            * 表格中的第一天和最后一天的日期对象
            * */
            var firstDateOfTable = new Date(year,month,firstDayDate-firstDay);
            var lastDateOfTable = new Date(year,month,lastDayDate+6-lastDay);
            //表格中的总天数
            var daysNumInTable = (lastDayDate+6-lastDay) - (firstDayDate-firstDay) + 1;

            //创建天数的容器div.month_body
            $box.find('.month_wrap').append("<div class='month_body'></div>");
            //循环生成span表格
            for(var j=0;j<daysNumInTable;j+=7){
                //按照一星期占一行的思路创建span标签
                var aWeek = addAweek();
                for(var i= j,k = 0;i<j+7;i++,k++){
                    var tempFullDate = new Date(year,month,firstDayDate-firstDay+i);

                    aWeek.find('span').eq(k).html(tempFullDate.getDate());
                    var curDate = new Date();
                    var curFullDate = new Date(curDate.getFullYear(),curDate.getMonth(),curDate.getDate());

                    //如果是标记日，加上标记日的样式 .lzDate-markType
                    //<i class='lzDate-output'>14<i class='lzDate-markText'>+1</i></i>
                    var markHandle = isMarked(year,month+1,firstDayDate-firstDay+i);
                    if(isObj(markHandle)){
                        aWeek.find('span').eq(k).html('<i class="lzDate-'+ markHandle.markType +'">'+tempFullDate.getDate()+'</i>')
                        aWeek.find('span').eq(k).find("i").append('<i class="lzDate-markText">'+ markHandle.markText +'</i>');
                    }

                    //如果是当前日，加上当前日的样式.curDay
                    if((settings.curDayStyle == true) && (tempFullDate.getTime() == curFullDate.getTime())){
                        aWeek.find('span').eq(k).html('<i class="curDay">'+tempFullDate.getDate()+'</i>')
                        if(isObj(markHandle)){
                           aWeek.find('span').eq(k).find("i.curDay").append('<i class="lzDate-markText">'+ markHandle.markText +'</i>');
                        }
                    }
                    //如果该天不在当月
                    if(!(new Date(year,month,0).getTime() < tempFullDate.getTime() && tempFullDate.getTime() <= new Date(year,month+1,0).getTime())){
                        aWeek.find('span').eq(k).addClass('notCurMonth');
                    }
                }
            }
            //让.month_body高度适应
            (function heightAuto(){
                $box.find('.month_wrap').height($box.find('.month_body').last().height());

            })()
            //插入文字下的一个小点
            $box.find(".curDay").append('<i style="position: absolute;bottom: 2px;left:15px; width:4px;height: 4px; border-radius: 50%; background-color: #fff;"></i>');
            /*
            * createDaySpan的私有函数，外部不可用
            * 增加一周的视图模板
            * 返回增加的视图对象
            * */
            function addAweek(){
                var table = $box.find(".month_wrap .month_body").last();
                var weekDom = '<div class="week"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>';
                table.append(weekDom);
                return table.find(".week").last();
            }
        }


        //给外部提供方法调用，更新日历表中的视图
        function refreshSpan(){
            $box.find('.month_wrap').html('');
            var year = $box.find('.top .year').text();
            var month = $box.find('.top .month').text();
            createDaySpan(parseInt(year),parseInt(month));
            bindSwipeEve();
        }

        //设置标记日
        function setMarks(jsonArr){
            settings.marks = jsonArr;
            refreshSpan();
        }

        //新增标记日
        function addMarks(jsonArr){
            settings.marks = settings.marks.concat(jsonArr);
            refreshSpan();
        }

        return {
            //参数必须是json数组
            setMarks:setMarks,
            addMarks:addMarks,
            getMarks:function(){
                return settings.marks;
            }
        }
    }

//此处传递参数$,是为了在zepto和jquery中都可用
})($)






