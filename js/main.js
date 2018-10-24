;(function() {
    var alert_sound = document.getElementById('alert-sound')
    //新建一个事件调度中心 Event
    var Event = new Vue()
    function copy(obj) {
        return Object.assign({},obj)
    }

    Vue.component('task', {
        template: '#task-tpl',
        props: ['todo'],
        //子组件不能操作父组数据，但是需要子组件通知父组件它想要干什么
        methods: {
            action: function(name, params) {
                Event.$emit(name, params)
            }
        }

    })
    new Vue ({
        el: '#main',
        data: {
            list: [],
            last_id: 0,
            current: {}
        },
        mounted: function(){
            var me = this
            //每隔一秒提示事项
            this.list = ms.get('list') || this.list
            this.last_id = ms.get('last_id') || this.last_id
            setInterval(function() {
                me.check_alerts()
            },1000)
            
            //这里注册父组件允许子组件触发的一些方法
            
            Event.$on('remove', function(id){
                if(id) {
                    me.remove(id)
                }
            })

            Event.$on('toggle_complete', function(id){
                if(id) {
                    me.toggle_complete(id)
                }
            })

            Event.$on('set_current', function(todo){
                if(todo) {
                    me.set_current(todo)
                }
            })

            Event.$on('toggle_detail', function(id){
                if(id) {
                    me.toggle_detail(id)
                }
            })
        },
        methods: {
            merge: function () {
                var is_update = this.current.id
                var id = is_update
                if(is_update) {
                    var index = this.find_index(id)
                    //Vue元素修改要使用Vue可以检测到的方式
                    // this.list[index] = copy(this.current) 不行
                    //向响应式对象中添加一个属性，并确保这个新属性同样是响应式的，且触发视图更新。Vue 无法探测普通的新增属性 
                    Vue.set(this.list, index, copy(this.current))
                } else {
                    var title = this.current.title
                    if(!title && title !== 0) return
                    var todo = copy(this.current)
                    //id自增机制
                    this.last_id++
                    ms.set('last_id',this.last_id)
                    todo.id = this.last_id
                    this.list.push(todo)
                    console.log(todo)
                }
                
                this.reset_current()
            },
            remove: function(id) {
                //Vue中的索引作为id不妥，应该从外部传入id
                var index = this.find_index(id)
                this.list.splice(index,1)
            },
            // next_id: function() {
            //     return this.list.length + 1
            // },
            set_current: function(todo) {
                this.current = copy(todo)
            },
            reset_current: function() {
                this.set_current({})
            },
            find_index: function(id) {
                return this.list.findIndex(function(item) {
                    return item.id == id
                })
            },
            toggle_complete: function(id) {
                var i = this.find_index(id)
                // this.list[i].completed = !this.list[i].completed
                Vue.set(this.list[i], 'completed', !this.list[i].completed)
                console.log(this.list[i])
            },
            check_alerts: function() {
                var me = this
                this.list.forEach(function (element, i){
                    var alert_at = element.alert_at
                    if(!alert_at || element.alert_confirmed) {
                        return
                    }
                    var alert_at = new Date(alert_at).getTime()
                    // console.log(alert_at)
                    var now = new Date().getTime()
                    // console.log(now)
                    if(now >= alert_at) {
                        alert_sound.play()
                        var confirmed = confirm(element.title)
                        Vue.set(me.list[i], 'alert_confirmed', confirmed)
                        // console.log("it's time!")
                    }
                })
            },
            toggle_detail: function(id) {
                var index = this.find_index(id)
                Vue.set(this.list[index], 'show_detail', !this.list[index].show_detail)
            }
        },
        watch: {
            list: {
                deep: true,
                handler: function(n, o) {
                    if(n) {
                        ms.set('list', n)
                    } else {
                        ms.set('list', [])
                    }
                }
            }
        }
    })
})()