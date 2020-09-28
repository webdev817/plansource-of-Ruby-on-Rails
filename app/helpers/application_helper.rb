module ApplicationHelper

  def title title
    base = "PlanSource.io"
    if !title.empty?
      "#{title} | #{base}"
    else
      base
    end
  end

  def exp_months
    [
      ["January (01)", "01"],
      ["February (02)", "02"],
      ["March (03)", "03"],
      ["April (04)", "04"],
      ["May (05)", "05"],
      ["June (06)", "06"],
      ["July (07)", "07"],
      ["August (08)", "08"],
      ["September (09)", "09"],
      ["October (10)", "10"],
      ["November (11)", "11"],
      ["December (12)", "12"],
    ]
  end

  def exp_years
    y = []
    d = Date.today
    10.times{ |i| y << d.year + i }
    y
  end

  def display_base_errors resource
    return '' if (resource.errors.empty?) or (resource.errors[:base].empty?)
    messages = resource.errors[:base].map { |msg| content_tag(:p, msg) }.join
    html = <<-HTML
    <div class="alert alert-error alert-block">
      <button type="button" class="close" data-dismiss="alert">&#215;</button>
      #{messages}
    </div>
    HTML
    html.html_safe
  end

  def basic_date_format(date)
    return "" unless date
    date.strftime("%m/%d/%Y")
  end

  def format_csi(csi)
    return "" unless csi
    csi = csi.to_s

    csiParts = csi.split('')
    if csi.length > 4
      csiParts = csiParts.insert(4, ' ')
    end
    if csi.length > 2
      csiParts = csiParts.insert(2, ' ')
    end

    return csiParts.join('')
  end
end
