import { Selector } from 'testcafe';

fixture('test funSketch')
  // port is specified in server.js. make sure server.js is running and then run this test in a separate terminal
  .page('http://localhost:3000');
  
test('basic test', async t => {
  await t.expect(Selector('title').textContent).eql(' funSketch ');
  await t.expect(Selector('h3').withText('funSketch').exists).ok();
  await t.expect(Selector('#count').withText('frame: 1, layer: 1').exists).ok();

  // check that toolbar section exists + instructions show
  await t.expect(Selector('.toolbar').exists).ok();
  await t.expect(Selector('section').withText('instructions').exists).ok();
  
  // check that there is a canvas + onion skin layer
  await t.expect(Selector('.canvasArea').child().count).eql(2);
  
  // check that the animation timeline exists
  await t.expect(Selector('.animationTimelineCanvas').exists).ok();
});