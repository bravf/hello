# 视频会议 case

## 交互

### 名词解释
* 方块：一个显示元素，包括有视频的和没视频的
* 灰块：没有视频时候的占位符，灰块里包含显示一个用户ID

### 第一页逻辑
* 只显示一个大方块
* 默认显示自己，如果自己开了摄像头就显示视频，否则显示灰块
* 如果双击了某个视频，则显示这个视频，如果这个视频关了摄像头，则显示这个人的灰块，如果这个人掉线，则显示自己。

### 第二页逻辑
* 默认排序按照 server 端
* 如果自己开了摄像头，把自己插到第一位

### 第 n （n >= 2） 页逻辑
* 每页显示 4 个方块
* 双击任何一个开了视频的方块， 跳转到第一页，并且在第一页显示这个视频


## 信令服务器
