// enable tab navigation
$('#tabnav a').click(function (e) {
  e.preventDefault()
  $(this).tab('show')
})
