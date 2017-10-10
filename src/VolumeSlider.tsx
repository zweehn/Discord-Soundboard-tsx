import * as React from 'react';
export class VolumeSlider extends React.Component<{initialvolume:number,updateVolume:any}, {}> {
	indicatorstyle: any;
	_lock: boolean;
	_charging: boolean;
	_charge: number;
	shapestyle: any;
	iconstyle: any;
	volume:any;
	updateVolume:any;
	constructor(props) {
		super(props);
		this._lock = false;
		this._charging = false;
		this._charge = 0;
		this.volume = props.initialvolume;
		this.updateVolume = props.updateVolume;
		this.indicatorstyle = {
			transform: `translateX(${this.volume*2}px)`
		};
	}


	/**
	 * Begin charge cycle
	 */
	charge() {
		if (this._lock) { return; }
		this._lock = true;

		// Reset
		this._charge = 0;
		this._charging = true;

		// Hide indicator
		this.indicatorstyle = {
			visibility: 'hidden',
			opacity: '0'
		}

		/**
		 * Charge loop
		 */
		let cycle = () => {
			if (this._charging && ++this._charge < 100) {
				requestAnimationFrame(() => {
					cycle();
				});
			}

			// Update icon styles
			this.shapestyle = { transform: `scale(${this._charge / 100})` };
			this.iconstyle = { transform: `rotate(${-0.35 * this._charge}deg)` };
			this.forceUpdate();
		};

		setTimeout(() => cycle(), 100);
	}


	/**
	 * Release and fire based on charge
	 * @param  {float} charge
	 */
	release(charge) {
		// Reset charge animation
		this._charging = false;
		requestAnimationFrame(() => { 
			this.shapestyle = { transform: `scale(0)` };
			this.forceUpdate();
		 });
		// Animation vars
		let y_cap = charge * 0.35,
			y_start = -0.3 * charge,
			x_cap = charge * 2,
			x_start = -10,
			duration = 20 + (4 * charge),
			start = new Date().getTime(),
			volume = this.volume,
			rotate;

		// Y animation
		let y_swap = duration * 0.55;

		let y_duration_up = y_swap,
			y_duration_down = duration - y_swap;

		let y = y_start,
			y_diff_up = -y_cap,
			y_diff_down = (y_cap - y_start);

		// X animation
		let x = x_cap,
			x_diff = x_cap - 10;

		// Display indicator
		this.indicatorstyle = {
			visibility: 'visible',
			opacity: '1'
		}
		

		/**
		 * Animation loop
		 */
		let animate = () => {
			let elapsed = new Date().getTime() - start;

			if (elapsed < duration) {
				// Animate
				requestAnimationFrame(() => { animate(); });

				if (elapsed < y_duration_up) {
					// Y up
					y = this.easeOut(elapsed, y_start, y_diff_up, y_duration_up);
				} else {
					// Y down
					y = this.easeIn(elapsed - y_duration_up, y_start - y_cap, y_diff_down, y_duration_down);
				}

				// Set values
				x = this.linearTween(elapsed, 0, x_diff, duration);
				rotate = this.easeInOut(elapsed, -0.35 * this._charge, 0.35 * this._charge, duration);
				this.volume = this.easeOut(elapsed, volume, charge - volume, duration);
			} else {
				// End of animation
				this._lock = false;

				// Set values
				x = x_cap;
				y = 0;
				rotate = 0;
				this.volume = charge;
			}
			this.updateVolume(this.volume);
			// Render values
			this.iconstyle = {
				transform: `rotate(${rotate}deg)`
			};

			this.indicatorstyle = {
				transform: `translateX(${x}px) translateY(${y}px)`
			};
			this.forceUpdate();
		};
		animate();
	}


	/**
	 * Linear progression
	 */
	linearTween(t, b, c, d) {
		return c * t / d + b;
	}


	/**
	 * Cubic ease-in progression
	 */
	easeIn(t, b, c, d) {
		t /= d;
		return c * t * t * t + b;
	}


	/**
	 * Cubic ease-out progression
	 */
	easeOut(t, b, c, d) {
		t /= d;
		t--;
		return c * (t * t * t + 1) + b;
	}


	/**
	 * Cubic ease-in-out progression
	 */
	easeInOut(t, b, c, d) {
		t /= d / 2;
		if (t < 1) {
			return c / 2 * t * t * t + b;
		}
		t -= 2;
		return c / 2 * (t * t * t + 2) + b;
	}
	render() {
		return (
			<div id="volume-slider">
				<svg id="volume-icon" className="volume-icon" style={this.iconstyle} viewBox="-1 0 33 32" onMouseDown={() => this.charge()} onMouseUp={() => this.release(this._charge)} >
					<defs>
						<mask id="circle-mask" x="-1" y="0" width="33" height="32">
							<circle cx="-1" cy="16" r="33" fill="white" id="circle-mask-shape" style={this.shapestyle} />
						</mask>

						<mask id="volume-mask" x="-1" y="0" width="33" height="32">
							<path d="M22.485 25.985c-0.384 0-0.768-0.146-1.061-0.439-0.586-0.586-0.586-1.535 0-2.121 4.094-4.094 4.094-10.755 0-14.849-0.586-0.586-0.586-1.536 0-2.121s1.536-0.586 2.121 0c2.55 2.55 3.954 5.94 3.954 9.546s-1.404 6.996-3.954 9.546c-0.293 0.293-0.677 0.439-1.061 0.439v0zM17.157 23.157c-0.384 0-0.768-0.146-1.061-0.439-0.586-0.586-0.586-1.535 0-2.121 2.534-2.534 2.534-6.658 0-9.192-0.586-0.586-0.586-1.536 0-2.121s1.535-0.586 2.121 0c3.704 3.704 3.704 9.731 0 13.435-0.293 0.293-0.677 0.439-1.061 0.439zM13 30c-0.26 0-0.516-0.102-0.707-0.293l-7.707-7.707h-3.586c-0.552 0-1-0.448-1-1v-10c0-0.552 0.448-1 1-1h3.586l7.707-7.707c0.286-0.286 0.716-0.372 1.090-0.217s0.617 0.519 0.617 0.924v26c0 0.404-0.244 0.769-0.617 0.924-0.124 0.051-0.254 0.076-0.383 0.076z" fill="white" mask="url(#circle-mask)"></path>
						</mask>

						<linearGradient id="grad-1" x1="0" x2="1" y1="0" y2="0">
							<stop offset="20%" stopColor="#9a88aa" />
							<stop offset="100%" stopColor="#6e33a5" />
						</linearGradient>
					</defs>

					<path className="volume-icon-bg" fill="#cbc8ce" d="M22.485 25.985c-0.384 0-0.768-0.146-1.061-0.439-0.586-0.586-0.586-1.535 0-2.121 4.094-4.094 4.094-10.755 0-14.849-0.586-0.586-0.586-1.536 0-2.121s1.536-0.586 2.121 0c2.55 2.55 3.954 5.94 3.954 9.546s-1.404 6.996-3.954 9.546c-0.293 0.293-0.677 0.439-1.061 0.439v0zM17.157 23.157c-0.384 0-0.768-0.146-1.061-0.439-0.586-0.586-0.586-1.535 0-2.121 2.534-2.534 2.534-6.658 0-9.192-0.586-0.586-0.586-1.536 0-2.121s1.535-0.586 2.121 0c3.704 3.704 3.704 9.731 0 13.435-0.293 0.293-0.677 0.439-1.061 0.439zM13 30c-0.26 0-0.516-0.102-0.707-0.293l-7.707-7.707h-3.586c-0.552 0-1-0.448-1-1v-10c0-0.552 0.448-1 1-1h3.586l7.707-7.707c0.286-0.286 0.716-0.372 1.090-0.217s0.617 0.519 0.617 0.924v26c0 0.404-0.244 0.769-0.617 0.924-0.124 0.051-0.254 0.076-0.383 0.076z"></path>

					<rect x="-1" y="0" width="33" height="32" mask="url(#volume-mask)" fill="url(#grad-1)" />
				</svg>

				<div className="volume-track">
					<span id="volume-indicator" style={this.indicatorstyle} className="volume-indicator"></span>
					<input value={this.volume} type="hidden" name="volume" id="volume-input" />
				</div>
			</div>
		);
	}
}
