/*
	Dream Elf Photography & Design Association Official Website
	soraharu.com | @XiaoXi
	
	官网 Contact Us 表单传输 & 前端反馈
	
	执行逻辑 Logical
	禁用表单，渲染 reCAPTCHA 组件
	收到 reCAPTCHA 回调后，将表单数据发送至后端，并监听后端 JSON 数据回调
	通过后端回调 resultCode 判断是否执行成功，并向前端反馈执行结果，视执行结果重新启用表单并重置 reCAPTCHA 组件
	在必要情况下引导用户通过电子邮件提交表单，并自动填充电子邮件内容为用户提交的表单内容
	捕捉后端错误并向前端反馈错误，引导用户通过电子邮件提交表单
	
	待实现 Feature
	隐式获取用户 IP 地址，防止自动提交脚本
	
	最新构建于2020年3月11日10点38分
*/

function recaptchaRender() {
	document.getElementById("name").readOnly = true;
	document.getElementById("email").readOnly = true;
	document.getElementById("message").readOnly = true;
	document.getElementById("button").disabled = true;
	document.getElementById("button").value = '请完成验证 / Please Complete Verification';
	document.getElementById("recaptcha-field").removeAttribute("style");
	try {
		grecaptcha.render('recaptcha', {
			'sitekey': '6LedFeAUAAAAADtc-8JNnL3DF5911gzVHMi7Yr2U',
			'callback': 'contactPost'
		});
	} catch (error) { } // Possible duplicated instances.
}

function enableResend() {
	document.getElementById("button").value = '重新发送 / Resend Messgae';
	document.getElementById("button").disabled = false;
}

function contactPost() {
	document.getElementById("recaptcha-field").setAttribute("style", "display: none;");
	document.getElementById("name").readOnly = false;
	document.getElementById("email").readOnly = false;
	document.getElementById("message").readOnly = false;
	$.ajax({
		type: "POST",
		dataType: "json",
		url: "./actions/contact.php",
		data: $('#contact').serialize(),
		success: function (result) {
			if (result.resultCode == 200) {
				document.getElementById("name").disabled = true;
				document.getElementById("email").disabled = true;
				document.getElementById("message").disabled = true;
				document.getElementById("contact").reset();
				document.getElementById("button").value = '已提交 / Submitted';
				mdui.alert('您的留言已经提交成功，我们将会尽快给予您回复。', '已提交 / Submitted');
			};
			if (result.resultCode == 500) {
				enableResend();
				mdui.confirm('在提交表单时遇到了一个预期之外的错误，这可能是网站服务器出现问题，您可以通过邮件与我们取得联系，或稍后尝试重新提交表单。', '服务器错误 / Server Error',
					function () { },
					function () {
						window.location.href = document.getElementById("supportmail").href + "?subject=[Form]%20Official%20Website%20Contact%20Us&body=" + document.getElementById("message").value;
					},
					{ confirmText: "确定", cancelText: "发送邮件" }
				);
			}
			if (result.resultCode == 403) {
				enableResend();
				mdui.confirm('您的请求被服务端拒绝，可能是您在短期内已经提交过留言，请您耐心等待，我们将会尽快给予您回复。如果您没有提交过留言，可能是您的IP地址正与他人共用，您可以尝试通过邮件与我们取得联系。', '请求被拒绝 / Request Denied',
					function () { },
					function () {
						window.location.href = document.getElementById("supportmail").href + "?subject=[Form]%20Official%20Website%20Contact%20Us&body=" + document.getElementById("message").value;
					},
					{ confirmText: "确定", cancelText: "发送邮件" }
				);
			};
			if (result.resultCode == 402) {
				enableResend();
				mdui.alert('请完整填写表单内容，以便我们能够与您取得联系。', '错误 / Error');
			};
			if (result.resultCode == 400) {
				enableResend();
				mdui.alert('您的电子邮件地址不正确。我们需要通过电子邮件与您取得联系，请您务必填写正确的电子邮件地址。', '错误 / Error');
			};
		},
		error: function () {
			enableResend();
			mdui.confirm('在提交表单时遇到了一个预期之外的错误，这可能是网站服务器出现问题，您可以通过邮件与我们取得联系，或稍后尝试重新提交表单。', '服务器错误 / Server Error',
				function () { },
				function () {
					window.location.href = document.getElementById("supportmail").href + "?subject=[Form]%20Official%20Website%20Contact%20Us&body=" + document.getElementById("message").value;
				},
				{ confirmText: "确定", cancelText: "发送邮件" }
			);
		}
	});
	grecaptcha.reset();
}