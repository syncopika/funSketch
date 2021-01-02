import { AnimationProject, Frame } from '../components/AnimationProject.js';

describe("test AnimationProject classes", () => {
	
	describe("test Frame class", () => {
		it("test frame methods", () => {
			const frame1 = new Frame("some-html-id", 2);
			
			const frame1data = frame1.getMetadata();
			expect(frame1data.currentIndex).toBe(0);
			expect(frame1data.number).toBe(2);
			expect(frame1data.containerId).toBe("some-html-id");
			
		});
	});
	
	describe("test AnimationProject class", () => {
		it("fill in", () => {
			expect(true).toEqual(true);
		});
	});
	
});