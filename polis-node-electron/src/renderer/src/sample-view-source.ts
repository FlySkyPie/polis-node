/* Copyright (c) 2017-present, Facebook, Inc. All rights reserved.

You are hereby granted a non-exclusive, worldwide, royalty-free license to use,
copy, modify, and distribute this software in source code or binary form for use
in connection with the web services and APIs provided by Facebook.

As with any software that integrates with the Facebook platform, your use of
this software is subject to the Facebook Platform Policy
[http://developers.facebook.com/policy/]. This copyright notice shall be
included in all copies or substantial portions of the software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */
import dayjs from 'dayjs'

/**
 * @reference https://github.com/fbsamples/Canvas-Streaming-Example
 */
export class SampleViewSource {
  private ctx: CanvasRenderingContext2D
  private frameCount = 0
  private rectState = [0, 0, 10]
  private rectStateVector = [1, 1, 1]
  private startTime: dayjs.Dayjs

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = this.canvas.getContext('2d')!

    this.ctx.font = '20px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillStyle = '#fff'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.startTime = dayjs()

    this.onFrame()
  }

  onFrame = (): void => {
    window.requestAnimationFrame(this.onFrame)
    this.frameCount++

    const currentTime = dayjs()
    const diff = currentTime.diff(this.startTime, 'milliseconds') / 1000

    const date = new Date()

    // Rotate hue every hour
    const hue = Math.floor(((date.getTime() % (60 * 60 * 1000)) / (60 * 60 * 1000)) * 360)

    // Rotate saturation every 5 seconds
    const sat = Math.floor(((date.getTime() % 5000) / 5000) * 100)

    // Rotate luminance every 20 seconds
    const lum = Math.floor(((date.getTime() % 20000) / 20000) * 100)

    // Rotate angle every minute
    const angle = (((date.getTime() % (60 * 1000)) / (60 * 1000)) * 360 * Math.PI) / 180

    this.ctx.resetTransform()

    this.ctx.filter = 'blur(1px)'
    this.ctx.drawImage(this.canvas, 0.5, 0, this.canvas.width - 1, this.canvas.height - 0.5)
    this.ctx.filter = 'none'
    this.ctx.globalAlpha = 1

    this.ctx.fillText(
      date.toISOString() + '  Frame: ' + this.frameCount.toLocaleString(),
      this.canvas.width / 2,
      this.canvas.height / 2
    )
    this.ctx.fillText(diff.toFixed(3) + ' sec', this.canvas.width / 2, this.canvas.height / 2 + 50)

    this.ctx.strokeStyle = '#000'
    this.ctx.strokeText(
      date.toISOString() + '  Frame: ' + this.frameCount.toLocaleString(),
      this.canvas.width / 2,
      this.canvas.height / 2
    )
    this.ctx.strokeText(
      diff.toFixed(3) + ' sec',
      this.canvas.width / 2,
      this.canvas.height / 2 + 50
    )

    this.ctx.translate(this.rectState[0], this.rectState[1])
    this.ctx.rotate(angle)
    this.ctx.strokeStyle = 'hsl(' + hue + ', ' + sat + '%, ' + lum + '%)'
    this.ctx.strokeRect(
      -this.rectState[2] / 2,
      -this.rectState[2] / 2,
      this.rectState[2],
      this.rectState[2]
    )
    if (this.rectState[0] >= this.canvas.width) {
      this.rectStateVector[0] = -1
    }
    if (this.rectState[0] <= 0) {
      this.rectStateVector[0] = 1
    }
    if (this.rectState[1] >= this.canvas.height) {
      this.rectStateVector[1] = -1
    }
    if (this.rectState[1] <= 0) {
      this.rectStateVector[1] = 1
    }
    if (this.rectState[2] >= 200) {
      this.rectStateVector[2] = -1
    }
    if (this.rectState[2] <= 5) {
      this.rectStateVector[2] = 1
    }
    for (let i = 0; i < this.rectState.length; i++) {
      this.rectState[i] += this.rectStateVector[i] * 1
    }
  }
}
