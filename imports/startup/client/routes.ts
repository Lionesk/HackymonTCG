declare let FlowRouter: any;
declare let BlazeLayout: any;
import '../../ui/layouts/MainLayout/MainLayout.ts'
import '../../ui/layouts/LandingLayout/LandingLayout.ts'
import '../../ui/layouts/PlayLayout/PlayLayout.ts'

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