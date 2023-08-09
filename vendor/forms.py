from django import forms
from .models import Vendor, OpeningHour
from accounts.validators import allow_only_images_validator


class VendorForm(forms.ModelForm):
    # profile_picture = forms.FileField(widget=forms.FileInput(attrs={'class': 'btn btn-info w-100'}), validators=[allow_only_images_validator])
    # cover_photo = forms.FileField(widget=forms.FileInput(attrs={'class': 'btn btn-info w-100'}), validators=[allow_only_images_validator])
    vendor_license = forms.FileField(widget=forms.FileInput(attrs={'class': 'btn btn-info w-100'}), validators=[allow_only_images_validator])

    class Meta:
        model = Vendor
        fields = ['vendor_name', 'vendor_license']


class OpeningHourForm(forms.ModelForm):
    class Meta:
        model = OpeningHour
        fields = ['day', 'from_hour', 'to_hour', 'is_closed']