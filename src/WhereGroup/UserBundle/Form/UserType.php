<?php

namespace WhereGroup\UserBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Validator\Constraints\File;


/**
 * Class UserType
 * @package WhereGroup\UserBundle\Form
 */
class UserType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('username')
            ->add('password', PasswordType::class, array('required' => false))
            ->add('email', null, array('required' => false))
            ->add(
                'groups',
                EntityType::class,
                array(
                    'class'        =>  'MetadorUserBundle:Group',
                    'multiple'     => true,
                    'choice_label' => 'role',
                    'label'        => 'Gruppe',
                    'required'     => false
                )
            )
            ->add(
                'picture',
                FileType::class,
                array(
                    'label'=>'Profile Picture',
                    'required' => false,
                    'data_class' => null,
                    'constraints' =>  new File([
                        'maxSize' => '1M',
                        'mimeTypes' => [
                            'image/jpeg',
                            'image/png',
                        ]
                    ]))
            )
            ->add('isActive')
            ;
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'WhereGroup\UserBundle\Entity\User'
        ));
    }
}
