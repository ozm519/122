---
title: 魔改版彩虹外链网盘系统详细更新指南
description: 魔改版彩虹外链网盘系统更新指南
published: 2026-02-18
tags: [网盘系统,更新指南,PHP,文件修改]
category: 网盘
draft: false
---

# 魔改版彩虹外链网盘系统详细更新指南

## 前言

本指南详细介绍如何更新魔改版彩虹外链网盘系统，确保系统功能正常运行并获得最新特性。更新过程主要涉及文件修改和配置调整，按照本指南的步骤操作，可以确保系统平稳更新。

## 更新前准备

在开始更新前，请确保：

1. **备份数据**：备份数据库和重要文件，特别是 `file` 目录（存储上传的文件）
2. **备份配置**：备份 `config.php` 文件，保留数据库配置信息
3. **准备工具**：使用文件管理器进行文件修改

## 更新内容

本次更新主要包含以下内容：

- 修复文件预览功能
- 优化视频播放器配置
- 增强文档预览支持
- 改进后台管理界面
- 修复已知bug

## 文件修改示例

以下是具体的文件修改示例，在文件管理器中找到对应文件并修改为新代码：

### 1. 修复视频预览功能

**文件**：`admin/file-view.php`

**完整代码**：

```php
<?php
/**
 * 文件预览
**/
include("../includes/common.php");
if($islogin==1){}else exit("<script language='javascript'>window.location.href='./login.php';</script>");

$id = isset($_GET['id'])?intval($_GET['id']):exit();
$row = $DB->getRow("SELECT * FROM pre_file WHERE id=:id", [':id'=>$id]);
if(!$row)exit();
$name = $row['name'];
$type = $row['type'];
$viewurl_all = $siteurl.'view.php/'.$row['hash'].'.'.$type;

$view_type = get_view_type($type);

@header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="zh-cn">
<head>
  <meta charset="utf-8"/>
  <meta name="renderer" content="webkit">
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title><?php echo $title ?></title>
  <link rel="stylesheet" href="https://s4.zstatic.net/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="https://s4.zstatic.net/ajax/libs/aplayer/1.10.1/APlayer.min.css">
  <link href="../assets/css/ckplayer.css" rel="stylesheet">
  <script src="https://s4.zstatic.net/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
<style type="text/css">
body{margin:0;background-color:#f8f9fa;}

/* 图片预览样式 */
.image_view {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-radius: 4px;
}

/* 音乐播放器样式 */
.view {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* 视频播放器样式 */
.videoplayer {
  width: 100%;
  background-color: #000;
  border-radius: 4px;
  overflow: hidden;
}

/* 文档预览样式 */
.doc_view {
  width: 100%;
  height: 90vh;
  border: none;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* 通用预览容器样式 */
#preview {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}
</style>
</head>
<body>
<div id="preview" align="center">
<?php
if($view_type == 'image'){
  echo '<a href="'.$viewurl_all.'" title="点击查看原图" target="_blank"><img alt="loading" src="'.$viewurl_all.'" class="image_view"></a>';
}elseif($view_type == 'audio'){
  echo '<div class="view"><div id="aplayer"></div></div>';
}elseif($view_type == 'video'){
  echo '<div class="videoplayer" style="width:100%"></div>';
}elseif($view_type == 'office'){
  // 使用Microsoft Office Online Viewer预览Office文档
  $office_url = 'https://view.officeapps.live.com/op/view.aspx?src='.rawurlencode($viewurl_all);
  echo '<iframe src="'.$office_url.'" class="doc_view" allowfullscreen></iframe>';
}else{
  // 其他类型文件显示下载链接
  echo '<div style="text-align:center;padding:40px;background-color:white;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);max-width:400px;margin:0 auto;">';
  echo '<i class="fa-regular fa-file fa-5x text-muted mb-4"></i>';
  echo '<h3 class="mb-2">'.$name.'</h3>';
  echo '<p class="text-muted mb-4">该文件类型不支持在线预览</p>';
  echo '<a href="'.$viewurl_all.'" class="btn btn-primary" target="_blank">';
  echo '<i class="fa-solid fa-download me-2"></i> 下载文件';
  echo '</a>';
  echo '</div>';
}
?>
</div>
<?php if($view_type == 'audio'){?>
<script type="text/javascript" src="https://s4.zstatic.net/ajax/libs/aplayer/1.10.1/APlayer.min.js"></script>
<script type="text/javascript">
var ap = new APlayer({
  container: document.getElementById('aplayer'),
  loop: 'none',
  theme: '#b2dae6',
  audio: [{
      title: '<?php echo $name?>',
      author: 'none',
      url: '<?php echo $viewurl_all?>',
      cover: '../assets/img/music.png',
  }]
});
</script>
<?php }elseif($view_type == 'video'){?>
<script type="text/javascript" src="../assets/js/ckplayer.min.js"></script>
<?php 
// 确保plug变量始终被定义
$plug = '';
if($type=='m3u8'){
    $plug='hls.js';
    echo '<script src="https://s4.zstatic.net/ajax/libs/hls.js/1.2.4/hls.min.js"></script>';
}elseif($type=='flv'||$type=='f4v'){
    $plug='flv.js';
    echo '<script src="https://s4.zstatic.net/ajax/libs/flv.js/1.6.2/flv.min.js"></script>';
}
?>
<script type="text/javascript">
  $(window).resize(function() {
    var height = $(window).height() - 20;
    $("#preview").height(height);
    $(".videoplayer").height(height);
  });
  $(window).resize(); // 初始化高度
  var videoObject = {
    container: '.videoplayer',
    plug:'<?php echo $plug?>',
    video:'<?php echo $viewurl_all?>',
    webFull:true,
  };
  var player=new ckplayer(videoObject);
</script>
<?php }?>
</body>
</html>
```

### 2. 修复前端视频预览

**文件**：`file.php`

**完整代码**：

```php
<?php
include("./includes/common.php");

$title = '文件查看 - '.$conf['title'];
$is_file=true;
include SYSTEM_ROOT.'header.php';

$csrf_token = md5(mt_rand(0,999).time());
$_SESSION['csrf_token'] = $csrf_token;

$hash = isset($_GET['hash'])?$_GET['hash']:exit("<script language='javascript'>window.location.href='./';</script>");
$pwd = isset($_GET['pwd'])?$_GET['pwd']:null;
$row = $DB->getRow("SELECT * FROM pre_file WHERE hash=:hash", [':hash'=>$hash]);
if(!$row)exit("<script language='javascript'>alert('文件不存在');window.location.href='./';</script>");
$name = $row['name'];
$type = $row['type'];

$downurl = 'down.php/'.$row['hash'].'.'.$type;
if(!empty($row['pwd']))$downurl .= '&'.$row['pwd'];
$viewurl = 'view.php/'.$row['hash'].'.'.$type;

$downurl_all = $siteurl.$downurl;
$viewurl_all = $siteurl.$viewurl;

$thisurl = $siteurl.'file.php?hash='.$row['hash'];
if(!empty($pwd))$thisurl .= '&pwd='.$pwd;

if($islogin2 && $row['uid']==$uid || !$islogin2 && isset($_SESSION['fileids']) && in_array($row['id'], $_SESSION['fileids']) && strtotime($row['addtime'])>strtotime("-7 days")){
  $is_mine = true;
}

$view_type = get_view_type($type);

if($view_type == 'image'){
  $filetype = 1;
  $title = '<i class="fa fa-picture-o"></i> 图片查看器';
  $htmlcode = htmlspecialchars('<img src="'.$viewurl_all.'"/>');
  $ubbcode = '[img]'.$viewurl_all.'[/img]';
  $linktitle = '图片链接';
}elseif($view_type == 'audio'){
  $filetype = 2;
  $title = '<i class="fa fa-music"></i> 音乐播放器';
  $htmlcode = htmlspecialchars('<audio id="bgmMusic" src="'.$viewurl_all.'" autoplay="autoplay" loop="loop" preload="auto"></audio>');
  $htmlcode2 = htmlspecialchars('<iframe src="'.$siteurl.'player.php?hash='.$hash.'" width="407" scrolling="no"frameborder="0"height="70"></iframe>');
  $ubbcode = '[audio=X]'.$viewurl_all.'[/audio]';
  $linktitle = '音乐链接';
}elseif($view_type == 'video'){
  $filetype = 3;
  $title = '<i class="fa fa-video-camera"></i> 视频播放器';
  $htmlcode = htmlspecialchars('<video id="movies" src="'.$viewurl_all.'" autobuffer="true" controls="" width="100%"></video>');
  $htmlcode2 = htmlspecialchars('<iframe src="'.$siteurl.'player.php?hash='.$hash.'" width="800" height="500" scrolling="no" frameborder="0"></iframe>');
  $ubbcode = '[movie=320*180]'.$viewurl_all.'[/movie]';
  $linktitle = '视频链接';
}else{
  $filetype = 0;
  $title = '<i class="fa fa-file"></i> 文件查看';
  $htmlcode = htmlspecialchars('<a href="'.$downurl_all.'" target="_blank">'.$name.'</a>');
  $ubbcode = '[url='.$downurl_all.']'.$name.'[/url]';
  if($view_type == 'office'){
    $office_url = 'https://view.officeapps.live.com/op/view.aspx?src='.rawurlencode($downurl_all);
  }
}
?>
<div class="container py-4">
    <div class="row g-4">
<?php
if($row['pwd']!=null && $row['pwd']!=$pwd){ ?>
  <div class="col-md-6 offset-md-3 mt-5">
      <div class="card shadow-sm border-0">
          <div class="card-body text-center p-5">
              <i class="fa-solid fa-lock fa-3x text-primary mb-3"></i>
              <h4 class="card-title mb-4">文件已加密</h4>
              <p class="text-muted mb-4">该文件受到密码保护，请输入密码继续访问</p>
              
              <form action="./file.php" method="get" class="mb-3">
                  <input type="hidden" name="hash" value="<?php echo $row['hash']?>">
                  <div class="input-group mb-3">
                      <input type="password" name="pwd" class="form-control" placeholder="请输入访问密码" required autofocus>
                      <button class="btn btn-primary" type="submit">确定</button>
                  </div>
              </form>
              <a href="javascript:history.back();" class="text-decoration-none text-muted small"><i class="fa-solid fa-arrow-left me-1"></i> 返回上一页</a>
          </div>
      </div>
  </div>
<?php
  include SYSTEM_ROOT.'footer.php';
  exit;
}

?>
      <div class="col-lg-9">
        <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-white border-bottom-0 py-3 d-flex align-items-center">
                <h5 class="mb-0 text-primary fw-bold">
                    <?php echo $title?>
                </h5>
            </div>
            <div class="card-body text-center p-4 min-vh-25 d-flex flex-column justify-content-center align-items-center bg-light rounded-3 mx-3 mb-3">
<?php
if($filetype==1){
  echo '<div class="image_view shadow-sm rounded overflow-hidden"><a href="'.$viewurl.'" title="点击查看原图" target="_blank"><img alt="'.$name.'" src="'.$viewurl.'" class="img-fluid" style="max-height: 500px;"></a></div>';
}elseif($filetype==2){
  echo '<div class="w-100" style="max-width: 500px;"><div id="aplayer"></div></div>';
}elseif($filetype==3 && $row['block']==0){
  echo '<div class="videoplayer w-100 shadow-sm rounded overflow-hidden" style="max-height: 500px;"></div>';
}elseif($filetype==3){
  echo '<div class="text-center py-5">
  <div class="mb-3"><i class="fa-solid fa-video-slash fa-4x text-muted opacity-50"></i></div>
  <h5 class="text-muted">视频审核中</h5>
  <p class="text-muted small">视频文件需审核通过后才能在线播放和下载，请等待审核通过！</p>
</div>';
}else{
  echo '<div class="text-center py-5">
  <div class="mb-4"><i class="fa '.type_to_icon($type).' fa-6x text-primary opacity-75"></i></div>
  <h4 class="mb-2 text-dark">'.$name.'</h4>
  <p class="text-muted mb-4">文件大小：'.size_format($row['size']).'</p>
  <div class="d-flex justify-content-center gap-3">
    <a href="'.$downurl.'" class="btn btn-primary btn-lg shadow-sm px-4"><i class="fa-solid fa-download me-2"></i> 下载文件</a>
    '.($view_type=='office'?'<a href="'.$office_url.'" class="btn btn-info btn-lg text-white shadow-sm px-4" target="_blank"><i class="fa-solid fa-eye me-2"></i> 在线预览</a>':'').'
  </div>
</div>';
}
?>
            </div>
        </div>

        <div class="card shadow-sm border-0">
            <div class="card-body">
                <ul class="nav nav-tabs nav-fill mb-4" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#link" type="button" role="tab"><i class="fa-solid fa-link me-2"></i>文件外链</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#code" type="button" role="tab"><i class="fa-solid fa-code me-2"></i>代码调用</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#info" type="button" role="tab"><i class="fa-solid fa-circle-info me-2"></i>文件详情</button>
                    </li>
                    <?php if($is_mine): ?>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link text-danger" data-bs-toggle="tab" data-bs-target="#manager" type="button" role="tab"><i class="fa-solid fa-gear me-2"></i>管理</button>
                    </li>
                    <?php endif; ?>
                </ul>
                
                <div class="tab-content p-2">
                    <div class="tab-pane fade show active" id="link" role="tabpanel">
                        <?php if($filetype!=0): ?>
                        <div class="mb-3 row align-items-center">
                            <label class="col-md-2 col-form-label text-muted text-md-end"><?php echo $linktitle?>：</label>
                            <div class="col-md-10">
                                <div class="input-group">
                                    <input type="text" class="form-control bg-light" value="<?php echo $viewurl_all?>" readonly>
                                    <button class="btn btn-outline-primary copy-btn" type="button" data-clipboard-text="<?php echo $viewurl_all?>"><i class="fa-regular fa-copy"></i> 复制</button>
                                </div>
                            </div>
                        </div>
                        <?php endif; ?>
                        <div class="mb-3 row align-items-center">
                            <label class="col-md-2 col-form-label text-muted text-md-end">下载链接：</label>
                            <div class="col-md-10">
                                <div class="input-group">
                                    <input type="text" class="form-control bg-light" value="<?php echo $downurl_all?>" readonly>
                                    <button class="btn btn-outline-primary copy-btn" type="button" data-clipboard-text="<?php echo $downurl_all?>"><i class="fa-regular fa-copy"></i> 复制</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-pane fade" id="code" role="tabpanel">
                        <?php if($filetype>=2): ?>
                        <div class="mb-3 row align-items-center">
                            <label class="col-md-2 col-form-label text-muted text-md-end">播放器代码：</label>
                            <div class="col-md-10">
                                <div class="input-group">
                                    <input type="text" class="form-control bg-light" value="<?php echo $htmlcode2?>" readonly>
                                    <button class="btn btn-outline-primary copy-btn" type="button" data-clipboard-text="<?php echo $htmlcode2?>"><i class="fa-regular fa-copy"></i> 复制</button>
                                </div>
                            </div>
                        </div>
                        <?php endif; ?>
                        <div class="mb-3 row align-items-center">
                            <label class="col-md-2 col-form-label text-muted text-md-end">HTML代码：</label>
                            <div class="col-md-10">
                                <div class="input-group">
                                    <input type="text" class="form-control bg-light" value="<?php echo $htmlcode?>" readonly>
                                    <button class="btn btn-outline-primary copy-btn" type="button" data-clipboard-text="<?php echo $htmlcode?>"><i class="fa-regular fa-copy"></i> 复制</button>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3 row align-items-center">
                            <label class="col-md-2 col-form-label text-muted text-md-end">UBB代码：</label>
                            <div class="col-md-10">
                                <div class="input-group">
                                    <input type="text" class="form-control bg-light" value="<?php echo $ubbcode?>" readonly>
                                    <button class="btn btn-outline-primary copy-btn" type="button" data-clipboard-text="<?php echo $ubbcode?>"><i class="fa-regular fa-copy"></i> 复制</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tab-pane fade" id="info" role="tabpanel">
                        <div class="table-responsive">
                            <table class="table table-bordered mb-0">
                                <tbody>
                                    <tr>
                                        <th class="bg-light text-center" width="150">上传者IP</th>
                                        <td><?php echo preg_replace('/\d+$/', '*', $row['ip'])?></td>
                                        <th class="bg-light text-center" width="150">上传时间</th>
                                        <td><?php echo $row['addtime']?></td>
                                    </tr>
                                    <tr>
                                        <th class="bg-light text-center">下载次数</th>
                                        <td><?php echo $row['count']?></td>
                                        <th class="bg-light text-center">文件大小</th>
                                        <td><?php echo size_format($row['size']).' ('.$row['size'].' 字节)'?></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="tab-pane fade" id="manager" role="tabpanel">
                        <div class="text-center py-4">
                            <input type="hidden" id="hash" name="hash" value="<?php echo $hash?>">
                            <input type="hidden" id="csrf_token" name="csrf_token" value="<?php echo $csrf_token?>">
                            <button onclick="delete_confirm()" class="btn btn-danger btn-lg shadow-sm"><i class="fa-solid fa-trash-can me-2"></i> 删除文件</button>
                            <p class="text-muted mt-2 small">删除后无法恢复，请谨慎操作</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <div class="col-lg-3">
        <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-white border-bottom-0 py-3">
                <h5 class="mb-0 text-primary fw-bold"><i class="fa-solid fa-circle-exclamation me-2"></i> 提示</h5>
            </div>
            <div class="card-body text-muted small">
                <?php echo $conf['gg_file']?>
            </div>
        </div>
        
        <div class="card shadow-sm border-0 d-none d-lg-block">
            <div class="card-header bg-white border-bottom-0 py-3">
                <h5 class="mb-0 text-primary fw-bold"><i class="fa-solid fa-qrcode me-2"></i> 手机扫码下载</h5>
            </div>
            <div class="card-body text-center">
                <img alt="二维码" src="//api.qrserver.com/v1/create-qr-code/?size=180x180&margin=10&data=<?php echo urlencode($thisurl);?>" class="img-thumbnail border-0">
            </div>
        </div>
      </div>
    </div>
  </div>
<?php include SYSTEM_ROOT.'footer.php';?>
</body>
</html>
<?php if($filetype==2){?>
<script type="text/javascript" src="https://s4.zstatic.net/ajax/libs/aplayer/1.10.1/APlayer.min.js"></script>
<script type="text/javascript">
var ap = new APlayer({
  container: document.getElementById('aplayer'),
  loop: 'none',
  theme: '#b2dae6',
  audio: [{
      title: '<?php echo $name?>',
      author: 'none',
      url: '<?php echo $viewurl_all?>',
      cover: './assets/img/music.png',
  }]
});
</script>
<?php }elseif($filetype==3 && $row['block']==0){?>
<script type="text/javascript" src="assets/js/ckplayer.min.js"></script>
<?php 
// 确保plug变量始终被定义
$plug = '';
if($type=='m3u8'){
    $plug='hls.js';
    echo '<script src="https://s4.zstatic.net/ajax/libs/hls.js/1.2.4/hls.min.js"></script>';
}elseif($type=='flv'||$type=='f4v'){
    $plug='flv.js';
    echo '<script src="https://s4.zstatic.net/ajax/libs/flv.js/1.6.2/flv.min.js"></script>';
}
?>
<script type="text/javascript">
  var videoObject = {
    container: '.videoplayer',
    plug:'<?php echo $plug?>',
    video:'<?php echo $viewurl_all?>',
    webFull:true,
  };
  var player=new ckplayer(videoObject);
</script>
<?php }?>
<script src="https://s4.zstatic.net/ajax/libs/layer/2.3/layer.js"></script>
<script src="https://s4.zstatic.net/ajax/libs/clipboard.js/1.7.1/clipboard.min.js"></script>
<script>
function delete_confirm(){
  var hash = $("#hash").val();
  var csrf_token = $("#csrf_token").val();
  var confirmobj = layer.confirm('删除文件后不可恢复，确定删除吗？', {
	  btn: ['确定','取消'], icon: 0
	}, function(){
    var ii = layer.load(2);
	  $.ajax({
      type : 'POST',
      url : 'ajax.php?act=deleteFile',
      data : {hash:hash, csrf_token:csrf_token},
      dataType : 'json',
      success : function(data) {
        layer.close(ii);
        if(data.code == 0){
          layer.alert('删除成功', {icon:1}, function(){window.location.href="./";});
        }else{
          layer.alert(data.msg, {icon:2});
        }
      },
      error:function(data){
        layer.close(ii);
        layer.msg('服务器错误');
      }
	  });
	}, function(){
	  layer.close(confirmobj);
	});
}
$(document).ready(function(){
  var clipboard = new Clipboard('.copy-btn');
  clipboard.on('success', function (e) {
    layer.msg('复制成功！', {icon: 1});
  });
  clipboard.on('error', function (e) {
    layer.msg('复制失败，请长按链接后手动复制', {icon: 2});
  });
})
</script>
```

### 2. 文件预览失败

**解决方案**：
- 检查文件类型是否支持预览
- 确保相关JavaScript文件加载正常
- 清除浏览器缓存后重试

### 3. 后台登录失败

**解决方案**：
- 检查用户名和密码是否正确
- 清除浏览器缓存和Cookie
- 检查服务器时间是否正确

## 注意事项

1. **文件权限**：确保目录有写入权限
2. **定期备份**：定期备份数据库和重要文件

## 结语

按照本指南的步骤操作，您可以成功更新魔改版彩虹外链网盘系统，获得更好的用户体验和更多功能。如果在更新过程中遇到问题，请参考常见问题解决方案或联系技术支持。

祝您使用愉快！

---

**更新时间**：2026-02-19
**系统版本**：V6.6
**更新状态**：完成
