declare let FlowRouter: any;
declare let BlazeLayout: any;


FlowRouter.route('/',{
    name:'landing',
    action(){
        BlazeLayout.render('MainLayout',{main:'LandingLayout'});
    }
});

FlowRouter.route('/play',{
    name:'play',
    action(){
        BlazeLayout.render('MainLayout',{main:'PlayLayout'}
    );}
});