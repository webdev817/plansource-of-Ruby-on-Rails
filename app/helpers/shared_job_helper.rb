module SharedJobHelper
  def prev_dev? shared_job
    (shared_job.get_permissions_for_user(@user) >> 7) % 2 == 1
  end

  def plans? shared_job
    (shared_job.get_permissions_for_user(@user) >> 2) % 2 == 1
  end

  def shops? shared_job
    (shared_job.get_permissions_for_user(@user) >> 1) % 2 == 1
  end

  def support? shared_job
    (shared_job.get_permissions_for_user(@user) >> 0) % 2 == 1
  end

  def calcs? shared_job
    (shared_job.get_permissions_for_user(@user) >> 3) % 2 == 1
  end

  def photos? shared_job
    (shared_job.get_permissions_for_user(@user) >> 4) % 2 == 1
  end

  def renderings? shared_job
    (shared_job.get_permissions_for_user(@user) >> 5) % 2 == 1
  end

  def client? shared_job
    (shared_job.get_permissions_for_user(@user) >> 6) % 2 == 1
  end
end
